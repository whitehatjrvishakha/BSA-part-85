import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { DrawerItems } from 'react-navigation-drawer';
import firebase from 'firebase';
import db from '../config';
import { Avatar } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from 'react-native-elements';
import { RFValue } from 'react-native-responsive-fontsize';

export default class CustomSideBarMenu extends React.Component {
    constructor() {
        super();
        this.state = {
            userId : firebase.auth().currentUser.email,
            image : '#',
            name : '',
            docId : ''
        };
    }
    selectPicture=async()=>{
        const {cancelled,uri} = await ImagePicker.launchImageLibraryAsync({
            mediaTypes : ImagePicker.MediaTypeOptions.All,
            allowsEditing : true,
            aspect : [1,1],
            quality : 1
        });
        if(!cancelled) {
            this.uploadImage(uri,this.state.userId);
        }
    }
    uploadImage=async(uri,imageName)=>{
        var response = await fetch(uri);
        var blob = await response.blob();
        var ref = firebase.storage().ref().child('user_profiles/'+imageName);
        return ref.put(blob).then(response=>{
            this.fetchImage(imageName);
        });
    }
    fetchImage=(imageName)=>{
        var storageRef = firebase.storage().ref().child('user_profiles/'+imageName);
        storageRef.getDownloadURL().then(url=>{
            this.setState({
                image : url
            });
        }).catch(e=>{
            console.log("no image");
        });
    }
    getUserProfile=()=>{
        db.collection('users').where('email_id','==',this.state.userId).onSnapshot(snapshot=>{
            snapshot.forEach(doc=>{
                this.setState({
                    name : doc.data().first_name + ' ' + doc.data().last_name,
                    docId : doc.id,
                    image : doc.data().image
                });
            });
        });
    }
    componentDidMount() {
        this.getUserProfile();
        this.fetchImage(this.state.userId);
    }
    render() {
        return (
            <View style={styles.container}>
                <View style={{flex : 0.5, alignItems : 'center', backgroundColor : 'orange'}}>
                    <Avatar
                    rounded
                    source = {{uri : this.state.image}}
                    size='medium'
                    onPress={this.selectPicture}
                    containerStyle={styles.imageContainer}
                    showEditButton
                    />
                    <Text style={{fontWeight : 'bold', fontSize : 20, padding : 10}}>{this.state.name}</Text>
                </View>
                <View style={styles.drawerItemContainer}>
                    <DrawerItems {...this.props}/>
                </View>
                <View style={styles.logOutContainer}>
                    <TouchableOpacity style={styles.logOutButton}
                    onPress={()=>{
                        this.props.navigation.navigate('WelcomeScreen')
                        firebase.auth().signOut();
                    }}>
                        <Icon name='logout' type='antdesign' iconStyle={{
                            paddingLeft : RFValue(10)
                        }}
                        size={RFValue(20)}/>
                        <Text style={{
                            fontSize : RFValue(15),
                            fontWeight : "bold",
                            marginLeft : RFValue(30)
                        }}>Log out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container : {
        flex : 1,
        marginTop : RFValue(30)
    },
    drawerItemContainer : {
        flex : 0.8
    },
    logOutContainer : {
        flex : 0.2,
        justifyContent : 'flex-end',
        paddingBottom : RFValue(30)
    },
    logOutButton : {
        height : '100%',
        width : '100%',
        flexDirection : 'row'
    },
    logOutText : {
        fontSize : RFValue(30),
        fontWeight : 'bold'
    }
});