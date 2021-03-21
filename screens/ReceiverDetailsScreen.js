import React, {Component} from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import firebase from 'firebase';
import db from '../config';
import { Card, Header, Icon } from 'react-native-elements';
import { RFValue } from 'react-native-responsive-fontsize';

export default class ReceiverDetailsScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId : firebase.auth().currentUser.email,
            receiverId : this.props.navigation.getParam('details')['user_id'],
            requestId : this.props.navigation.getParam('details')['request_id'],
            bookName : this.props.navigation.getParam('details')['book_name'],
            reasonToRequest : this.props.navigation.getParam('details')['reason_to_request'],
            receiverName : '',
            receiverContact : '',
            receiverAddress : '',
            receiverRequestDocId : '',
            userName : []
        }
    }
    getReceiverDetails=()=>{
        db.collection('users').where('email_id','==',this.state.receiverId).get()
        .then(snapshot=>{
            snapshot.forEach(doc=>{
                this.setState({
                    receiverName : doc.data().first_name,
                    receiverContact : doc.data().contact,
                    receiverAddress : doc.data().address
                });
            });
        });
        db.collection('requested_books').where('request_id','==',this.state.requestId).get()
        .then(snapshot=>{
            snapshot.forEach(doc=>{
                this.setState({
                    receiverRequestDocId : doc.id
                });
            });
        });
    }
    componentDidMount() {
        this.getReceiverDetails();
        this.getUserDetails(this.state.userId);
    }
    updateBookStatus=async()=>{
        db.collection('all_donations').add({
            book_name : this.state.bookName,
            request_id : this.state.requestId,
            donor_id : this.state.userId,
            requested_by : this.state.receiverName,
            request_status : "Donor interested"
        });
    }
    getUserDetails=(userId)=>{
        db.collection('users').where('email_id','==',userId).get()
        .then(snapshot=>{
            snapshot.forEach(doc=>{
                this.setState({
                    userName : doc.data().first_name + " " + doc.data().last_name
                });
            });
        });
    }
    addNotification=()=>{
        var message = this.state.userName + " has shown interest in donating a book.";
        db.collection('all_notifications').add({
            "targetted_user_id" : this.state.receiverId,
            "donor_id" : this.state.userId,
            "request_id" : this.state.requestId,
            "book_name" : this.state.bookName,
            "date" : firebase.firestore.FieldValue.serverTimestamp(),
            "notification_status" : "unread",
            "message" : message
        });
    }
    render() {
        return (
            <View style={styles.container}>
                <View style={{flex:0.1}}>
                    <Header
                        leftComponent={<Icon name='arrow-left' type='feather' color='#696969' onPress={()=>{this.props.navigation.goBack()}}/>}
                        centerComponent={{text : 'Donate books', style : {color : '#90a5a9', fontSize : RFValue(20), fontWeight : "bold"}}}
                        backgroundColor={'#eaf8fe'}
                    />
                </View>
                <View style={{flex : 0.3}}>
                    <Card
                        title={"Book information"}
                        titleStyle={{fontSize : RFValue(20)}}
                    >
                        <Card>
                            <Text style={{fontWeight : 'bold'}}>Name : {this.state.bookName}</Text>
                        </Card>
                        <Card>
                            <Text style={{fontWeight : 'bold'}}>Reason : {this.state.reasonToRequest}</Text>
                        </Card>
                    </Card>
                </View>
                <View style={{flex : 0.3}}>
                    <Card
                        title={"Receiver information"}
                        titleStyle={{fontSize : RFValue(20)}}
                    >
                        <Card>
                            <Text style={{fontWeight : 'bold'}}>Name : {this.state.receiverName}</Text>
                        </Card>
                        <Card>
                            <Text style={{fontWeight : 'bold'}}>Contact : {this.state.receiverContact}</Text>
                        </Card>
                        <Card>
                            <Text style={{fontWeight : 'bold'}}>Address : {this.state.receiverAddress}</Text>
                        </Card>
                    </Card>
                </View>
				<View style={styles.buttonContainer}>
					{
						this.state.receiverId !== this.state.userId
						?(
							<TouchableOpacity
								style={styles.button}
								onPress={()=>{
                                    this.updateBookStatus();
                                    this.addNotification();
                                    this.props.navigation.navigate('MyDonations');
							}}>
							<Text>I want to donate</Text>
							</TouchableOpacity>
						)
						: null
					}
				</View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
  container: {
    flex:1,
  },
  buttonContainer : {
    flex:0.3,
    justifyContent:'center',
    alignItems:'center'
  },
  button:{
    width:RFValue(200),
    height:RFValue(50),
    justifyContent:'center',
    alignItems : 'center',
    borderRadius: RFValue(10),
    backgroundColor: 'orange',
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: RFValue(8)
     },
    elevation : RFValue(16)
  }
});