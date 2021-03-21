import React from 'react';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { AppTabNavigator } from './AppTabNavigator';
import CustomSidebarMenu from './CustomSideBarMenu';
import SettingScreen from '../screens/SettingScreen';
import MyDonationsScreen from '../screens/MyDonationsScreen';
import NotificationScreen from '../screens/NotificationScreen';
import { Icon } from 'react-native-elements';

export const AppDrawerNavigator = createDrawerNavigator({
    Home : {
        screen : AppTabNavigator,
        navigationOptions : {
            drawerIcon : <Icon name='home' type='fontawesome5'/>
        }
    },
	MyDonations : {
        screen : MyDonationsScreen,
        navigationOptions : {
            drawerIcon : <Icon name='gift' type='font-awesome'/>,
            drawerLabel : 'My Donations'
        }
    },
    Notifications : {
        screen : NotificationScreen,
        navigationOptions : {
            drawerIcon : <Icon name='bell' type='font-awesome'/>,
            drawerLabel : 'My Notifications'
        }
    },
    Setting : {
        screen : SettingScreen,
        navigationOptions : {
            drawerIcon : <Icon name='cog' type='font-awesome'/>,
            drawerLabel : 'Profile Settings'
        }
    }
},
{
    contentComponent : CustomSidebarMenu
},
{
    initialRouteName : 'Home'
}
);