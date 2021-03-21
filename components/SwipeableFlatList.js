import React,{Component} from 'react';
import { View, Text, Dimensions, StyleSheet, Animated } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { ListItem, Icon } from 'react-native-elements';
import db from '../config';
import { RFValue } from 'react-native-responsive-fontsize';

export default class SwipeableFlatList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allNotifications : this.props.allNotifications
        };
    }
    onSwipeValueChange=(swipeData)=>{
        var allNotifications = this.state.allNotifications;
        const {key,value} = swipeData;
        if(value < Dimensions.get('window').width) {
            const newData = [...allNotifications];
            const previousIndex = allNotifications.findIndex(item=>item.key===key);
            this.updateMarkAsRead(allNotifications[previousIndex]);
            newData.splice(previousIndex,1);
            this.setState({
                allNotifications : newData
            });
        }
    }
    updateMarkAsRead=(notification)=>{
        console.log(notification);
        db.collection('all_notifications').doc(notification.doc_id).update({
            'notification_status' : 'read'
        });
    }
    renderItem=(data)=>(
        <Animated.View>
            <ListItem
            leftElement={
                <Icon name='book' type='font-awesome' color='#696969'/>
            }
            title={data.item.book_name}
            titleStyle={{
                color : 'black',
                fontWeight : 'bold'
            }}
            subtitle={data.item.message}
            bottomDivider
            />
        </Animated.View>
    )
    renderHiddenItem=()=>(
        <View style={styles.rowBack}>
            <View style={[styles.backRightButton,styles.backRightButtonRight]}>
                <Text style={styles.backTextWhite}></Text>
            </View>
        </View>
    )
    render() {
        return (
            <View style={styles.container}>
                <SwipeListView
                disableRightSwipe
                data={this.state.allNotifications}
                renderItem={this.renderItem}
                renderHiddenItem={this.renderHiddenItem}
                rightOpenValue={-Dimensions.get('window').width}
                onSwipeValueChange={this.onSwipeValueChange}
                previewRowKey={'0'}
                previewOpenValue={-40}
                previewOpenDelay={3000}
                />
            </View>
        )
    }
};

const styles=StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1
    },
    backTextWhite: {
        color: '#FFF',
        fontWeight:'bold',
        fontSize:RFValue(15)
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: '#29b6f6',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: RFValue(15)
    },
    backRightButton: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: RFValue(100)
    },
    backRightButtonRight: {
        backgroundColor: '#29b6f6',
        right: 0
    }
});