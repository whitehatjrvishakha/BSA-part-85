import React, {Component} from 'react';
import {Text, View, StyleSheet, FlatList} from 'react-native';
import {ListItem} from 'react-native-elements';
import firebase from 'firebase';
import db from '../config';
import MyHeader from '../components/MyHeader';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { RFValue } from 'react-native-responsive-fontsize';

export default class BookDonateScreen extends Component{
	componentDidMount() {
		this.getRequestedBookList();
	}
	constructor() {
		super();
		this.state = {
			requestedBookList : []
		}
		this.requestRef = null;
	}
	getRequestedBookList=()=>{
		this.requestRef=db.collection('requested_books').onSnapshot((snapshot)=>{
			var requestedBookList = snapshot.docs.map(document=>document.data());
			this.setState({requestedBookList : requestedBookList});
		});
	}
	keyExtractor=(item,index)=>index.toString()
	renderItem=({item,i})=>{
		return (
			<ListItem
				key={i}
				title={item.book_name}
				subtitle={item.reason_to_request}
				titleStyle={{
					color : 'black',
					fontWeight : 'bold',
				}}
				rightElement={
					<TouchableOpacity style={styles.button} onPress={()=>{
						this.props.navigation.navigate('receiverDetails',{'details' : item});
					}}>
						<Text style={{color : '#ffffff'}}>View</Text>
					</TouchableOpacity>
				}
				bottomDivider
			/>
		)
	}
	render(){
		return(
			<View style={{flex : 1}}>
				<MyHeader title={"Donate books"} navigation={this.props.navigation}/>
				<View style={{flex : 1}}>
					{this.state.requestedBookList.length===0 ? (<View style={styles.subContainer}>
						<Text>List of all requested books</Text>
					</View>) : (
						<FlatList
							keyExtractor={this.keyExtractor}
							data={this.state.requestedBookList}
							renderItem={this.renderItem}
						/>
					)}
				</View>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	subContainer:{
		flex:1,
		justifyContent:'center',
		alignItems:'center'
	},
	button:{
		width:RFValue(100),
		height:RFValue(30),
		justifyContent:'center',
		alignItems:'center',
		backgroundColor:"#ff5722",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: RFValue(8)
		}
	}
});