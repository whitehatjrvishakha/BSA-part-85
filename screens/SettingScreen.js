import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import MyHeader from '../components/MyHeader';
import firebase from 'firebase';
import 'firebase/auth';
import db from '../config';
import { RFValue } from 'react-native-responsive-fontsize';

export default class SettingScreen extends React.Component {
    componentDidMount() {
        this.getUserDetails();
    }
    constructor() {
        super();
        this.state = {
            email : '',
            contactNumber : '',
            address : '',
            firstName : '',
            lastName : '',
            docID : ''
        }
    }
    getUserDetails=()=>{
        console.log("in function");
        var user = firebase.auth().currentUser;
        var email = user.email;
        db.collection('users').where('email','==',email).get().then((snapshot)=>{
            console.log("in query");
            snapshot.forEach(doc => {
                console.log("in snapshot");
                var data = doc.data();
                console.log(data);
                this.setState({
                    email : data.email,
                    contactNumber : data.mobileNumber,
                    firstName : data.firstName,
                    lastName : data.lastName,
                    address : data.address,
                    docID : doc.id
                });
                console.log(this.state);
            });
        });
    }
    updateDetails=()=>{
        db.collection('users').doc(this.state.docID).update({
            'mobileNumber' : this.state.contactNumber,
            'firstName' : this.state.firstName,
            'lastName' : this.state.lastName,
            'address' : this.state.address
        });
    }
    render() {
        return (
            <View style={{alignContent : 'center', marginTop : RFValue(30)}}>
                <MyHeader title={"Settings"} navigation={this.props.navigation}/>
                <View style={styles.formContainer}>
                    <Text style={styles.label}>First name</Text>
                    <TextInput
                        placeholder={"First Name"}
                        value={this.state.firstName}
                        onChangeText={(text)=>{
                            this.setState({
                                firstName : text
                            });
                        }}
                        style={styles.formTextInput}
                    />
                    <TextInput
                        placeholder={"Last Name"}
                        value={this.state.lastName}
                        onChangeText={(text)=>{
                            this.setState({
                                lastName : text
                            });
                        }}
                        style={styles.formTextInput}
                    />
                    <TextInput
                        placeholder={"Contact Number"}
                        value={this.state.contactNumber}
                        onChangeText={(text)=>{
                            this.setState({
                                contactNumber : text
                            });
                        }}
                        style={styles.formTextInput}
                    />
                    <TextInput
                        placeholder={"Address"}
                        value={this.state.address}
                        onChangeText={(text)=>{
                            this.setState({
                                address : text
                            });
                        }}
                        style={styles.formTextInputMultiLine}
                        multiline={true}
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={this.updateDetails}
                    >
                        <Text style={styles.buttonText}>Save details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    label : {
        fontSize : RFValue(18),
        color : '#717d7e',
        fontWeight : 'bold',
        padding : RFValue(10),
        marginLeft : RFValue(20)
    },
    container : {
        flex:1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    formContainer:{
        flex:1,
        width:'100%',
        alignItems: 'center'
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
    formTextInputMultiLine:{
        width:"75%",
        minHeight:RFValue(35),
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
    buttonText:{
        fontSize:RFValue(25),
        fontWeight:"bold",
        color:"#fff"
    }
});