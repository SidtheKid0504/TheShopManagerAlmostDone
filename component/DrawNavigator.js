import React from 'react';
import { 
    StyleSheet, 
    Text, 
    View,
} from 'react-native';
import { createDrawerNavigator } from 'react-navigation-drawer';
import {Icon} from 'react-native-elements';
import { TabNavigator } from './BottomTab';
import  Sidebar  from './Sidebar';
import SettingScreen from '../screens/SettingScreen';
import MyDonationsScreen from '../screens/MyDonationsScreen';
import NotificationsScreen from '../screens/NotifScreen';
import MyReceivedBookScreen from '../screens/MyReceivedBookScreen';

export const DrawerNavigator = createDrawerNavigator({
    Home: {
        screen: TabNavigator,
        navigationOptions:{
            drawerIcon : <Icon name="home" type ="font-awesome" />,
            drawerLabel : "Home"
        }
    },
    My_Donations: {
        screen: MyDonationsScreen,
        navigationOptions: {
            drawerIcon : <Icon name="gift" type ="font-awesome" />,
            drawerLabel : "My Donations"
        }
    },
    Notifications: {
        screen: NotificationsScreen,
        navigationOptions:{
            drawerIcon : <Icon name="bell" type ="font-awesome" />,
            drawerLabel : "Notifications"
        }
    },
    Received_Books: {
        screen: MyReceivedBookScreen,
        navigationOptions:{
            drawerIcon : <Icon name="gift" type ="font-awesome" />,
            drawerLabel : "Received Books"
        }
    },
    Setting: {
        screen: SettingScreen,
        navigationOptions:{
            drawerIcon : <Icon name="settings" type ="fontawesome5" />,
            drawerLabel : "Settings"
        }
    }
    },
    {
        contentComponent: Sidebar
    },
    {
        initialRouteName: "Home"                                                              
    }
)
