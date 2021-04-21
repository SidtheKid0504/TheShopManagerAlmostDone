import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import Header from '../component/Header';
import firebase from 'firebase';
import db from '../config';
import { Alert } from 'react-native';


export default class SettingScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      emailID: "",
      phoneNum: "",
      address: "",
      lastName: "",
      firstName: "",
      docID: ""
    }
  }
  componentDidMount() {
    this.getUserDetails();
  }
  render() {
    return(
        <View style={styles.container}>
          <Header title="Settings" navigation={this.props.navigation}/>
          <View style={styles.settingContainer}>
              <Text style={styles.labelStyle}>First Name</Text>
              <TextInput 
                placeholder= {"First Name"}
                maxLength= {8}
                style={styles.settingsInput}
                onChangeText= {(text) => {
                  this.setState({
                    firstName: text
                  })
                }}
                value = {this.state.firstName}
              />

            <Text style={styles.labelStyle}>Last Name</Text>
            <TextInput 
                placeholder= {"Last Name"}
                maxLength= {13}
                style={styles.settingsInput}
                onChangeText= {(text) => {
                  this.setState({
                    lastName: text
                  })
                }}
                value={this.state.lastName}
              />

              <Text style={styles.labelStyle}>Phone Number</Text>
              <TextInput 
                placeholder= {"Phone Number"}
                maxLength= {10}
                keyboardType={"numeric"}
                style={styles.settingsInput}
                onChangeText= {(text) => {
                  this.setState({
                    phoneNum: text
                  })
                }}
                value={this.state.phoneNum}
              />

              <Text style={styles.labelStyle}>Address</Text>
              <TextInput 
                placeholder= {"Address"}
                multiline={true}
                style={styles.settingsInput}
                onChangeText= {(text) => {
                  this.setState({
                    address: text
                  })
                }}
                value={this.state.address}
              />

              <TouchableOpacity
                style={styles.settingButton}
                onPress={() => {
                  this.updateUserDetails();
                }}
              >
                <Text style={styles.settingButtonText}>Save Changes</Text>
              </TouchableOpacity>
          </View>
        </View>
    )
  }
  getUserDetails = () => {
    let user = firebase.auth().currentUser;
    let email = user.email
    db.collection("users").where("email", "==", email).get().
    then(snapshot => {
      snapshot.forEach(doc => {
        let data = doc.data();
        this.setState({
          emailID: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          phoneNum: data.phoneNum,
          docID: doc.id
        });
      });
    })
  }
  
  updateUserDetails = () => {
    db.collection("users").doc(this.state.docID).
    update({
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      address: this.state.address,
      phoneNum: this.state.phoneNum
    });
    Alert.alert("Profile Updated");
    console.log("Profile Updated");
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    settingContainer: {
      flex: 1,
      alignItems: "center"
    },
    labelStyle: {
      padding: RFValue(10),
      marginTop: RFValue(10),
      fontSize: RFValue(18),
      color: "#00008B"
    },
    settingsInput: {
      width: "90%",
      height: RFValue(50),
      alignSelf: "center",
      borderRadius: 2,
      borderWidth: 1,
      marginBottom: RFValue(20),
      marginLeft: RFValue(5),  
      padding: RFValue(10),
      borderColor: "gray"
    },
    settingButton: {
      width: "75%",
      height: RFValue(50),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderRadius: RFValue(50),
      marginTop: RFValue(20),
      backgroundColor: '#95e8ff'
    },
    settingButtonText: {
      fontSize: RFValue(20), 
      fontWeight: "bold"
    }
});
