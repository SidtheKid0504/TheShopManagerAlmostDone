import React from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    TextInput, 
    TouchableOpacity,
    TouchableHighlight, 
    Alert, 
    Modal, 
    KeyboardAvoidingView,
    ScrollView,
    FlatList,
    Image
} from 'react-native';
import AppHeader  from "../component/Header";
import { BookSearch } from 'react-native-google-books';
import firebase from 'firebase';
import db from '../config';

export default class RequestScreen extends React.Component {
    constructor() {
        super();
        this.state = {
            userID: firebase.auth().currentUser.email,
            bookName: '',
            description: '',
            requestedBookName: '',
            isBookRequestActive: '',
            bookStatus: "pending",
            requestID: '',
            userDocID: '',
            docID: '',
            dataSource: '',
            isShowFlatList: false
        }
    }

    componentDidMount() {
        this.getBookRequest();
        this.isBookRequestActive();
    }

    renderItem = ({item, index}) => {
        return (
            <TouchableHighlight
                style= {{alignItems: "center", padding:10, width: "90%", backgroundColor:"#ff9e9e"}}
                activeOpacity= {0.6}
                underlayColor= "#000000"
                onPress= {() => {
                    this.setState({
                        bookName: item.volumeInfo.title,
                        isShowFlatList: false
                    });
                }}

                bottomDivider
            >
                <Text>{item.volumeInfo.title}</Text>
            </TouchableHighlight>
        )
    }

    render() {
        if (this.state.isBookRequestActive === true) {
            return(
                <View style={[styles.container, {backgroundColor: '#ffdfbf'}]}>
                    <AppHeader title="Book Already Requested"/>
                    <View style={styles.alreadyRequested}>
                        <Text>Book Name: </Text>
                        <Text>{this.state.alreadyRequested}</Text>
                    </View>
                    <View style={styles.alreadyRequested}>
                    <Text> Book Status: </Text>
        
                    <Text>{this.state.bookStatus}</Text>
                    </View>
                    <TouchableOpacity style={styles.alreadyRequestedButton}
                    onPress={()=>{
                        this.sendNotification();
                        this.updateBookStatus();
                        this.receivedBooks(this.state.requestedBookName)
                    }}>
                    <Text>I recieved the book </Text>
                    </TouchableOpacity>
                </View>
            )
        } else {
            return (
                <View style={styles.container}>
                    <AppHeader title="Request Book"/>
                    <KeyboardAvoidingView style={styles.keyboardView}>
                        <TextInput
                            style={styles.formTextInput}
                            placeholder= {"Enter Book Name"}
                            onChangeText = {(text) => {
                                this.getBookAPI(text);
                            }}
                            onClear= {(text) => {
                                this.getBookAPI("");
                            }}
                            value = {this.state.bookName}
                        />

                        {
                            this.state.isShowFlatList ? 
                            (
                                <FlatList 
                                    data= {this.state.dataSource}
                                    renderItem= {this.renderItem}
                                    enableEmptySection= {true}
                                    style= {{marginTop: 10}}
                                    keyExtractor={(item,index) => index.toString()}
                                />
                            )
                            : 
                            (
                                console.log("")
                            )
                        }
    
                        <TextInput
                            style={[styles.formTextInput, {width: "75%",height: 300}]}
                            placeholder= {"Enter Reason For Why You Want the Book"}
                            multiline
                            numberOfLines = {8}
                            onChangeText = {(text) => {
                                this.setState({
                                    description: text
                                });
                            }}
                            value= {this.state.description}
                        />

                        <TouchableOpacity
                            onPress= {()=> {
                                this.addRequest(this.state.bookName, this.state.description);
                            }}
                            style={styles.reqButton}
                        >
                            <Text>Request Book</Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
            )
            }
        }

        sendNotification=()=>{
            //to get the first name and last name
            db.collection('users').where('email','==',this.state.userID).get()
            .then((snapshot)=>{
              snapshot.forEach((doc)=>{
                var name = doc.data().firstName
                var lastName = doc.data().lastName
          
                // to get the donor id and book nam
                db.collection('all_notifs').where('requestID','==',this.state.requestID).get()
                .then((snapshot)=>{
                  snapshot.forEach((doc) => {
                    var donorId  = doc.data().donorID
                    var bookName =  doc.data().bookName
          
                    //targert user id is the donor id to send notification to the user
                    db.collection('all_notifs').add({
                      "targetUserID" : donorId,
                      "message" : name +" " + lastName + " received the book " + bookName ,
                      "notifstatus" : "unread",
                      "bookName" : bookName
                    })
                  })
                })
              })
            })
          }
       
    receivedBooks=(bookName)=>{
        var userId = this.state.userID;
        var requestId = this.state.requestID
        db.collection('received_books').add({
            "userID": userId,
            "bookName":bookName,
            "requestID"  : requestId,
            "bookStatus"  : "received",
        })
    }
    addRequest = async(bookName, reasonToReq) => {
        let userID = this.state.userID;
        let randomRequestID = Math.random().toString(36).substring(7);
        let books = await BookSearch.searchbook(bookName,'AIzaSyBddOQV8BwcHSzaz7BaWEAdA-drFJCDnBM');
        db.collection("requested_books").add({
            userID: userID,
            bookName: bookName,
            reasonToRequest: reasonToReq,
            requestID: randomRequestID,
            bookStatus: "requested",
            date: firebase.firestore.FieldValue.serverTimestamp(),
            imageLink: books.data[0].volumeInfo.imageLinks.smallThumbnail
        });
        Alert.alert("Request Has Been Added");
        await this.getBookRequest();
        db.collection('users').where("email","==",userID).get()
        .then()
        .then((snapshot)=>{
            snapshot.forEach((doc)=>{
            db.collection('users').doc(doc.id).update({
                isBookRequestValid: true
            })
            })
        })
        this.setState({
            bookName: '',
            description: '',
            requestId: randomRequestID
        })
        return Alert.alert("Book Requested");
    }

    getBookRequest = () => {
        let bookRequest = db.collection('requested_books').
        where("userID", "==", this.state.userID).get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                if (doc.data().bookStatus !== "received") {
                    this.setState({
                        requestedBookName: doc.data().bookName,
                        bookStatus: doc.data().bookStatus,
                        requestID: doc.data().requestID,
                        docID: doc.id
                    });
                }
            })
        })
    }

    isBookRequestActive = () => {
        db.collection("users").where('email', '==', this.state.userID)
        .onSnapshot((snapshot) => {
            snapshot.forEach((doc) => {
                this.setState({
                    isBookRequestActive: doc.data().isBookRequestValid,
                    userDocID: doc.id
                });
            });
        })
    }

    updateBookStatus = () => {
        db.collection('requested_books').doc(this.state.docID)
        .update({
            bookStatus: "received",
        });

        db.collection('users').where("email", "==", this.state.userID).get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                db.collection('users').doc(doc.id).update({
                    isBookRequestValid: false
                })
            }) 
        })
    }

    async getBookAPI(bookName) {
        this.setState({bookName: bookName});
        if (bookName.length > 2) {
            let books = await BookSearch.searchbook(bookName,'AIzaSyBddOQV8BwcHSzaz7BaWEAdA-drFJCDnBM');
            this.setState({
                dataSource: books.data,
                isShowFlatList: true
            });
        }
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1
    },
    keyboardView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    formTextInput: {
        backgroundColor: "#ff9e9e",
        width: "75%",
        height: 35,
        marginTop: 20, 
        alignSelf: "center",
        borderRadius: 10,
        borderWidth: 1,
        padding: 10
    },
    reqButton: {
        width: '75%',
        height: 40,
        alignItems: "center", 
        justifyContent: 'center',
        borderWidth: 1.5,
        borderRadius: 10,
        backgroundColor:"#ffffe0",
        marginTop: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.30,
        shadowRadius: 10.32,
        elevation: 16,
    },
    alreadyRequested: {
        borderColor:"#ff9e9e",
        borderWidth: 2,
        justifyContent:'center',
        alignItems:'center',
        padding:10,
        margin:10
    },
    alreadyRequestedButton: {
        borderWidth:1,
        borderColor:'#ff9e9e',
        backgroundColor:"#ffffe0",
        width:300,
        alignItems:'center',
        alignSelf:'center',
        height:30,
        marginTop:30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.30,
        shadowRadius: 10.32,
        elevation: 16,
    }
})