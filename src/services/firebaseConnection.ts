import firebase from 'firebase/app';
import 'firebase/firestore';

let firebaseConfig = {
    apiKey: "AIzaSyAhE9DxtMC21UrACft77zJEkIsO1mXoefY",
    authDomain: "boardapp-3145c.firebaseapp.com",
    projectId: "boardapp-3145c",
    storageBucket: "boardapp-3145c.appspot.com",
    messagingSenderId: "39207471964",
    appId: "1:39207471964:web:124dee3ebfe98cf7b10f99",
    measurementId: "G-24QTSHVKE9"
};
  
if ( !firebase.apps.length ){
   firebase.initializeApp(firebaseConfig);
}

export default firebase;