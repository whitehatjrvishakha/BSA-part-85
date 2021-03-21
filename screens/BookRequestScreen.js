import React,{Component} from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
TouchableHighlight} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader';
import { BookSearch } from 'react-native-google-books';
import { ApiKey } from '../components/ApiKey';
import { FlatList } from 'react-native-gesture-handler';
import { RFValue } from 'react-native-responsive-fontsize';

export default class BookRequestScreen extends Component{
  constructor(){
    super();
    this.state ={
      userId : firebase.auth().currentUser.email,
      bookName : "",
      reasonToRequest : "",
      requestId : '',
      requestedBookName : '',
      isBookRequestActive : '',
      bookStatus : '',
      docId : '',
      userDocId : '',
      imageLink : '',
      showFlatList : false,
      dataSource : ''
    }
  }

  createUniqueId(){
    return Math.random().toString(36).substring(7);
  }

  getBookRequest=()=>{
    var bookRequest = db.collection('requested_books').where('user_id','==',this.state.userId).get()
    .then(snapshot=>{
      snapshot.forEach(doc=>{
        if(doc.data().book_status!='received') {
          this.setState({
            requestId : doc.data().request_id,
            requestedBookName : doc.data().book_name,
            bookStatus : doc.data().book_status,
            docId : doc.id
          });
        }
      });
    });
  }
  getBookFromApi=async(bookName)=>{
    this.setState({
      bookName : bookName
    });
    if(bookName.length > 2) {
      var books = await BookSearch.searchbook(bookName,ApiKey);
      this.setState({
        dataSource : books.data,
        showFlatList : true
      });
    }
  }
  renderItem=({item,i})=>{
    return (
      <TouchableHighlight
      style={{
        alignItems : "center",
        padding : RFValue(10),
        width : '90%',
        backgroundColor : '#dddddd'
      }}
      activeOpacity={0.6}
      underlayColor={'#dddddd'}
      onPress={()=>{
        this.setState({
          showFlatList : false,
          bookName : item.volumeInfo.title
        });
      }}
      bottomDivider>
        <Text>{item.volumeInfo.title}</Text>
      </TouchableHighlight>
    )
  }
  componentDidMount() {
    this.getBookRequest();
    this.getIsBookRequestActive();
  }

  setReceiveBooks=(bookName)=>{
    var requestId = this.state.requestId;
    var userId = this.state.userId;
    db.collection('received_books').add({
      "user_id" : userId,
      "request_id" : requestId,
      "book_name" : bookName,
      "book_status" : 'received'
    });
  }

  getIsBookRequestActive=()=>{
    db.collection('users').where('email_id','==',this.state.userId).onSnapshot(querySnapshot=>{
      querySnapshot.forEach(doc=>{
        this.setState({
          isBookRequestActive : doc.data().is_book_request_active,
          userDocId : doc.id
        });
      });
    });
  }

  sendNotification=()=>{
    db.collection('users').where('email_id','==',this.state.userId).get()
    .then(snapshot=>{
      snapshot.forEach(doc=>{
        var firstName = doc.data().first_name;
        var lastName = doc.data().last_name;
        db.collection('all_notifications').where('request_id','==',this.state.requestId).get()
        .then(snapshot=>{
          snapshot.forEach(doc=>{
            var donorId = doc.data().donor_id;
            var bookName = doc.data().book_name;
            db.collection('all_notifications').add({
              'targetted_user_id' : donorId,
              'message' : firstName + ' ' + lastName + ' received the book ' + bookName,
              'book_name' : bookName,
              'notification_status' : 'unread',
              'date' : firebase.firestore.FieldValue.serverTimestamp(),
              'donor_id' : '',
              'request_id' : this.state.requestId
            });
          });
        });
      });
    });
  }

  updateBookRequestStatus=()=>{
    db.collection('requested_books').doc(this.state.docId).update({
      book_status : 'received'
    });
    db.collection('users').where('email_id','==',this.state.userId).get()
    .then(snapshot=>{
      snapshot.forEach(doc=>{
        db.collection('users').doc(doc.id).update({
          is_book_request_active : false
        });
      });
    });
  }

  addRequest=async(bookName,reasonToRequest)=>{
    var userId = this.state.userId
    var randomRequestId = this.createUniqueId()
    var books = await BookSearch.searchbook(bookName,ApiKey);
    console.log(books);
    db.collection('requested_books').add({
        "user_id": userId,
        "book_name":bookName,
        "reason_to_request":reasonToRequest,
        "request_id"  : randomRequestId,
        "book_status" : 'requested',
        "date" : firebase.firestore.FieldValue.serverTimestamp()
    })
    await this.getBookRequest();
    db.collection('users').where('email_id','==',userId).get()
    .then(snapshot=>{
      snapshot.forEach(doc=>{
        db.collection('users').doc(doc.id).update({
          is_book_request_active : true
        });
      });
    });
    this.setState({
        bookName :'',
        reasonToRequest : '',
        requestId : randomRequestId
    });

    return Alert.alert("Book Requested Successfully");
  }


  render(){
    if(this.state.isBookRequestActive) {
      // show the status screen
      return(
        <View style = {{flex:1,justifyContent:'center'}}>
          <View style={{borderColor:"orange",borderWidth:RFValue(2),justifyContent:'center',alignItems:'center',padding:RFValue(10),margin:RFValue(10)}}>
            <Text>Book Name</Text>
            <Text>{this.state.requestedBookName}</Text>
          </View>
          <View style={{borderColor:"orange",borderWidth:RFValue(2),justifyContent:'center',alignItems:'center',padding:RFValue(10),margin:RFValue(10)}}>
          <Text>Book Status</Text>
          <Text>{this.state.bookStatus}</Text>
          </View>
          <TouchableOpacity 
          style={{borderWidth:RFValue(1),borderColor: 'orange', backgroundColor:'orange',width:RFValue(300),alignSelf:'center',alignItems:'center',height:RFValue(30),marginTop:RFValue(30)}}
          onPress={()=>{
            this.sendNotification()
            this.updateBookRequestStatus()
            this.setReceiveBooks(this.state.requestedBookName)
          }}
        >
          <Text>I Recieved the book</Text>
          </TouchableOpacity>
          </View>
      )
    } else {
      return(
          <View style={{flex:1}}>
            <MyHeader title="Request Book" navigation= {this.props.navigation}/>
            <View>
              <TextInput style={styles.formTextInput}
              placeholder={'Enter a book name'}
              onChangeText={text=>this.getBookFromApi(text)}
              onClear={text=>this.getBookFromApi('')}
              value={this.state.bookName}/>
              {
                this.state.showFlatList ? (
                  <FlatList
                  data={this.state.dataSource}
                  renderItem={this.renderItem}
                  enableEmptySections={true}
                  style={{
                    marginTop : RFValue(10)
                  }}
                  keyExtractor={(item,index)=>index.toString()}/>
                ) : (
                  <View style={{alignItems : 'center'}}>
                    <TextInput
                    style={[styles.formTextInput,{
                      height : RFValue(300)
                    }]}
                    multiline
                    numberOfLines={8}
                    placeholder={'Why do you need the book?'}
                    onChangeText={text=>{
                      this.setState({
                        reasonToRequest : text
                      });
                    }}
                    value={this.state.reasonToRequest}
                    />
                    <TouchableOpacity
                    style={styles.button}
                    onPress={()=>{
                      this.addRequest(this.state.bookName,this.state.reasonToRequest);
                    }}
                    >
                      <Text>Request</Text>
                    </TouchableOpacity>
                  </View>
                )
              }
            </View>
            {/*scroll view here*/}
              </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  keyBoardStyle : {
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  formTextInput:{
    width:"75%",
    height:RFValue(35),
    alignSelf:'center',
    borderColor:'#ffab91',
    borderRadius:RFValue(10),
    borderWidth:RFValue(1),
    marginTop:RFValue(20),
    padding:RFValue(10),
  },
  button:{
    width:"75%",
    height:RFValue(50),
    justifyContent:'center',
    alignItems:'center',
    borderRadius:RFValue(10),
    backgroundColor:"#ff5722",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: RFValue(8),
    },
    shadowOpacity: RFValue(0.44),
    shadowRadius: RFValue(10.32),
    elevation: RFValue(16),
    marginTop:RFValue(20)
    },
  }
)