import React, {Component} from 'react';
import {View,Text,StyleSheet,FlatList} from 'react-native';
import {ListItem,Icon} from 'react-native-elements';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader';
import db from '../config';
import SwipeableFlatList from '../components/SwipeableFlatList';
import { RFValue } from 'react-native-responsive-fontsize';


export default class NotificationScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId : firebase.auth().currentUser.email,
            allNotifications : []
        };
        this.notificationRef = null;
    }
    getNotifications=()=>{
        console.log(this.state.userId);
        this.notificationRef = db.collection("all_notifications")
        .where("notification_status", "==", "unread")
        .where("targetted_user_id",'==',this.state.userId)
        .onSnapshot((snapshot)=>{
            var allNotifications =  [];
            snapshot.docs.map((doc) =>{
                console.log("here");
                var notification = doc.data();
                notification["doc_id"] = doc.id;
                allNotifications.push(notification);
            });
            console.log(allNotifications);
            this.setState({
                allNotifications : allNotifications
            });
        });
    }
    keyExtractor = (item, index) => index.toString()
    renderItem = ({item,index}) =>{ 
        return (
            <ListItem
            key={index}
            leftElement={
                <Icon name="book" type="font-awesome" color ='#696969'/>
            }
            title={item.book_name}
            titleStyle={{ color: 'black', fontWeight: 'bold' }}
            subtitle={item.message}
            bottomDivider
            />
        )
    }
    componentDidMount() {
        this.getNotifications();
    }
    componentWillUnmount() {
        this.notificationRef();
    }
    render() {
        return (
            <View style={styles.container}>
                <View style={{flex : 0.1}}>
                    <MyHeader title={"Notifications"} navigation={this.props.navigation}/>
                </View>
                <View style={{flex : 0.9}}>
                    {
                        this.state.allNotifications.length === 0
                        ?(
                            <View style={{flex : 1,justifyContent : 'center', alignItems : 'center'}}>
                                <Text style={{fontSize : RFValue(25)}}>You have no notifications</Text>
                            </View>
                        )
                        :(
                            <SwipeableFlatList
                            allNotifications={this.state.allNotifications}
                            />
                        )
                    }
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container : {
        flex : 1
    }
});