import React from 'react';
import { 
    StyleSheet, 
    Text, 
    View,
    TouchableOpacity,
} from 'react-native';
import { DrawerItems } from 'react-navigation-drawer';
import { Avatar, Icon } from 'react-native-elements';
import {RFValue} from 'react-native-responsive-fontsize';
import * as ImagePicker from 'expo-image-picker';
import firebase from 'firebase';
import db from '../config';

export default class Sidebar extends React.Component{
    
    state = {
        userID: firebase.auth().currentUser.email,
        image: "",
        name: "",
        docID: ""
    }

    componentDidMount() {
        this.fetchImage(this.state.userID);
        this.getUserProfiles();
    }
    render() {
        return(
            <View style={styles.container}>
                <View
                    style={{
                        flex: 0.5,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "yellow",
                    }}
                    >
                    <Avatar
                        rounded
                        source={{
                            uri: this.state.image,
                        }}
                        size= {"xLarge"}
                        onPress={() => this.selectPicture()}
                        containerStyle={styles.imageContainer}
                        showEditButton
                    />
                    <Text style={{ fontWeight: "100", fontSize: 20, paddingTop: 10, fontWeight: "bold"}}>
                        {this.state.name}
                    </Text>
                    </View>
                <View style={styles.drawerContainer}>
                    <DrawerItems
                        {...this.props}
                    />
                </View>
                <View style={styles.logoutContainer}>
                    <TouchableOpacity
                    style={styles.logoutButton}
                    onPress= {() => {
                        this.props.navigation.navigate("WelcomeScreen");
                        firebase.auth().signOut();
                    }}
                    >
                        <Text
                            style= {{fontSize: RFValue(30), fontWeight: "bold", marginLeft: RFValue(30)}}
                        >Log Out</Text>
                        <Icon
                            name= "logout"
                            type= "antdesign"
                            size= {RFValue(15)}
                            iconStyle= {{paddingLeft: RFValue(10)}}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    selectPicture = async () => {
        const { cancelled, uri } = await ImagePicker.launchImageLibraryAsync(
            {
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1
            }
        )
        if (!cancelled) {
            this.setState({
                image: uri
            });
            this.uploadImage(uri, this.state.userID);
        } 
    }

    uploadImage = async (uri, imageName) => {
        let response = await fetch(uri);
        let blob = await response.blob();
        let ref = firebase.storage().ref().child("user_profiles/" + imageName);
        return ref.put(blob).then((response) => {
            console.log("Image Fetched");
            this.fetchImage(imageName);
        })
    }

    fetchImage = (imageName) => {
        let ref = firebase.storage().ref().child("user_profiles/" + imageName);
        ref.getDownloadURL().then((url) => {
            this.setState({
                image: url
            });
        }).catch((error) => {
            this.setState({
                image: "#"
            });
        })
    }

    getUserProfiles = () => {
        db.collection("users").where("email", "==", this.state.userID)
        .onSnapshot((snapshot) => {
            snapshot.forEach((doc) => {
                this.setState({
                    name: doc.data().firstName + " " + doc.data().lastName
                });
                console.log(this.state.name)
            })
        })
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    drawerContainer: {
        flex: 0.8
    },
    logoutContainer: {
        flex: 0.4
    },
    logoutButton: {
        width: "100%",
        height: "100%",
        flexDirection: 'row'
    },
    imageContainer: {
        flex: 0.75,
        marginTop: 30,
        width: "40%",
        height: "20%",
        borderRadius: 40,
        borderColor: "#000000"
    }
})


