import LandingPage from './LandingPage';
import InspectorDashboard from './InspectorDashboard';
import { useState, useEffect, useRef } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { initializeApp } from "firebase/app";
import exifr from 'exifr';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "firebase/auth";
import {
  getFirestore, doc, setDoc, getDoc, runTransaction, collection,
  addDoc, serverTimestamp, query, where, orderBy, onSnapshot,
  deleteDoc, getDocs, limit
} from "firebase/firestore";


// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const translations = {
  "Marathi": {
    "NEW CHAT": "नवीन चॅट",
    "OFFLINE MODE": "ऑफलाईन मोड",
    "RESET COUNTER": "काउंटर रीसेट करा",
    "DARK MODE?": "डार्क मोड?",
    "LIGHT MODE?": "लाईट मोड?",
    "CHAT HISTORY": "चॅट इतिहास",
    "Language": "भाषा",
    "Welcome,": "स्वागत आहे,",
    "Add another account": "दुसरे खाते जोडा",
    "Switch Accounts": "खाते बदला",
    "Sign-Out": "साइन-आउट",
    "Recent Chats": "अलीकडील चॅट",
    "No saved chats yet.": "अजून कोणतीही चॅट सेव्ह केलेली नाही.",
    "Are you sure you want to clear this history?": "तुम्हाला खात्री आहे का की तुम्हाला हा इतिहास पुसायचा आहे?",
    "This chat will be removed from Chat History.": "ही चॅट 'चॅट इतिहास' मधून काढून टाकली जाईल.",
    "No": "नाही",
    "Yes": "होय",
    "Hello": "नमस्कार",
    "How can I help you with road safety today?": "आज मी आपल्याला रस्ता सुरक्षेबाबत कशी मदत करू शकतो?",
    "Upload a Photo...": "फोटो अपलोड करा...",
    "Upload a Photo and Describe the Issue...": "फोटो अपलोड करा आणि समस्येचे वर्णन करा...",
    "Type a message...": "संदेश टाईप करा...",
    "Drop image to attach to chat": "चॅटमध्ये जोडण्यासाठी प्रतिमा येथे ड्रॉप करा",
    "Analyzing Road Data... ": "रस्ता डेटाचे विश्लेषण होत आहे... ",
    "TICKET:": "तिकीट:",
    "Potholes": "खड्डे",
    "Severity": "तीव्रता",
    "Road:": "रस्ता:",
    "Target Completion:": "लक्ष्य समाप्ती:",
    "CONTRACTOR": "कंत्राटदार",
    "PROJECT ENGINEER": "प्रकल्प अभियंता",
    "Click here to view the location on Google Maps": "Google Maps वर स्थान पाहण्यासाठी येथे क्लिक करा",
    "REPORTS LOG": "अहवाल लॉग",
    "TICKETS": "तिकीट",
    "No reports generated yet.": "अजून कोणताही अहवाल तयार झालेला नाही.",
    "Reported:": "नोंदवले गेले:",
    "Just now": "आत्ताच",
    "Allocated": "आवंटित",
    "OPEN": "खुले",
    "Location": "स्थान",
    "Potholes Detected": "खड्डे आढळले",
    "Confirmed by Road Inspector": "रस्ता निरीक्षकाद्वारे पुष्टी",
    "Status": "स्थिती",
    "Change?": "बदलायचे?",
    "Operations & Resource Allocation": "कामकाज आणि संसाधन वाटप",
    "Budget Allocation (INR)": "बजेट वाटप (INR)",
    "Repair Deadline": "दुरुस्तीची अंतिम मुदत",
    "Select a date...": "तारीख निवडा...",
    "Save Allocations & Deadline": "वाटप आणि अंतिम मुदत जतन करा",
    "Confirm Status": "स्थितीची पुष्टी करा",
    "Are you sure you want to change the status to ": "तुम्हाला खात्री आहे का की तुम्हाला स्थिती यामध्ये बदलायची आहे: ",
    "Cancel": "रद्द करा",
    "Confirm": "पुष्टी करा",
    "Chat View": "चॅट दृश्य",
    "Admin View": "व्यवस्थापक दृश्य",
    "CHAT VIEW": "चॅट दृश्य",
    "ADMIN VIEW": "व्यवस्थापक दृश्य",
    "Offline Mode: Site functionality is currently limited.": "ऑफलाईन मोड: साईटची कार्यक्षमता सध्या मर्यादित आहे.",
    "Localization is unavailable while offline.": "ऑफलाईन असताना भाषा स्थानिकीकरण उपलब्ध नाही.",
    "History is unavailable while offline.": "ऑफलाईन असताना इतिहास उपलब्ध नाही.",
    "User profile is unavailable while offline.": "ऑफलाईन असताना वापरकर्ता प्रोफाइल उपलब्ध नाही.",
    "BUDGET ALLOCATED": "बजेट वाटप झाले",
    "IN PROGRESS": "प्रगतीपथावर",
    "RESOLVED": "निकाली काढले",
    "DECLINED": "नकार दिला",
    "Only PNG and JPEG files are allowed.": "केवळ PNG आणि JPEG फाईल्सना अनुमती आहे.",
    "Only 1 image can be attached at a time.": "एका वेळी केवळ १ प्रतिमा जोडली जाऊ शकते.",
    "Report updated successfully!": "अहवाल यशस्वीरित्या अपडेट केला!",
    "Failed to update report.": "अहवाल अपडेट करण्यात अयशस्वी.",
    "Status update timed out. Please check your connection.": "स्थिती अपडेटची वेळ संपली. कृपया तुमचे कनेक्शन तपासा.",
    "Failed to update status.": "स्थिती अपडेट करण्यात अयशस्वी.",
    "Status updated to ": "स्थिती बदलून ही करण्यात आली आहे: ",
    "Failed to load chat history.": "चॅट इतिहास लोड करण्यात अयशस्वी.",
    "Connection restored! Syncing your data...": "कनेक्शन पुनर्संचयित झाले! तुमचा डेटा सिंक होत आहे...",
    "Ticket counter has been reset to 0.": "तिकीट काउंटर 0 वर रीसेट केले आहे.",
    "Failed to reset counter.": "काउंटर रीसेट करण्यात अयशस्वी.",
    "Offline: Data saved locally. Auto-sync will start when online.": "ऑफलाईन: डेटा स्थानिकरित्या जतन केला. ऑनलाईन आल्यावर ऑटो-सिंक सुरू होईल.",
    "Groq AI Core Offline: Ensure your Uvicorn server is running on port 8000!": "Groq AI कोर ऑफलाईन: तुमचा Uvicorn सर्व्हर पोर्ट 8000 वर चालू असल्याची खात्री करा!",
    "Could not connect to Krater YOLO Backend": "Krater YOLO बॅकएंडशी कनेक्ट होऊ शकले नाही",
    "Vision Core Offline: Check your Python YOLO server!": "व्हिजन कोर ऑफलाईन: तुमचा Python YOLO सर्व्हर तपासा!",
    "Analysis complete! I found ": "विश्लेषण पूर्ण झाले! मला ",
    " pothole(s) with ": " खड्डे आढळले ज्यांची तीव्रता ",
    " severity. Ticket ": " आहे. तिकीट ",
    " created.": " तयार केले गेले.",
    "Analysis complete! I didn't find any potholes in this image. No ticket was created, as the road looks clear.": "विश्लेषण पूर्ण झाले! मला या प्रतिमेत कोणतेही खड्डे आढळले नाहीत. रस्ता साफ दिसत असल्याने कोणतेही तिकीट तयार केले गेले नाही.",
    "Select a report from the log to view details & allocate resources.": "तपशील पाहण्यासाठी आणि संसाधने वाटप करण्यासाठी लॉगधून एक अहवाल निवडा.",
    "Sign-In": "साइन-इन",
    "Register": "नोंदणी करा",
    "Username": "वापरकर्ता नाव",
    "Password": "पासवर्ड",
    "Confirm Password": "पासवर्डची पुष्टी करा",
    "New User?": "नवीन वापरकर्ता?",
    "Already a User?": "आधीच वापरकर्ता आहात?",
    "Location:": "स्थान:",
    "Report": "अहवाल द्या",
    "Decline": "नकार द्या",
    "Road Inspector": "रस्ता निरीक्षक",
    "EST. MATERIAL": "अंदाजे सामग्री",
    "Est. Material": "अंदाजे सामग्री",
    "EST. COST": "अंदाजे खर्च",
    "Est. Cost": "अंदाजे खर्च",
    "ALLOCATED BUDGET": "वाटप केलेले बजेट",
    "Allocated Budget": "वाटप केलेले बजेट",
    "sq meters": "चौकट मीटर",
    "Pending": "प्रलंबित",
    "Pending Admin": "व्यवस्थापक प्रलंबित",
    "AI Estimated Budget (INR)": "AI अंदाजे बजेट (INR)",
    "Material Required (Asphalt)": "आवश्यक सामग्री (डांबर)",

  },
  "Bhojpuri": {
    "NEW CHAT": "नया चैट",
    "OFFLINE MODE": "ऑफलाइन मोड",
    "RESET COUNTER": "काउंटर रीसेट करीं",
    "DARK MODE?": "डार्क मोड?",
    "LIGHT MODE?": "लाइट मोड?",
    "CHAT HISTORY": "चैट इतिहास",
    "Language": "भाषा",
    "Welcome,": "स्वागत बा,",
    "Add another account": "दूसर खाता जोड़ीं",
    "Switch Accounts": "खाता बदलीं",
    "Sign-Out": "साइन-आउट",
    "Recent Chats": "हाल के चैट",
    "No saved chats yet.": "अभी तक कौनो सहेजल चैट नईखे।",
    "Are you sure you want to clear this history?": "का रउआ सचहूँ ई इतिहास मिटावे के चाहत बानी?",
    "This chat will be removed from Chat History.": "ई चैट 'चैट इतिहास' से हटा दिहल जाई।",
    "No": "ना",
    "Yes": "हाँ",
    "Hello": "प्रणाम",
    "How can I help you with road safety today?": "आज हम रउआ सड़क सुरक्षा में कइसे मदद कई सकीं?",
    "Upload a Photo...": "फोटो अपलोड करीं...",
    "Upload a Photo and Describe the Issue...": "फोटो अपलोड करीं अउर समस्या बताईं...",
    "Type a message...": "संदेश टाइप करीं...",
    "Drop image to attach to chat": "चैट में जोड़े खातिर फोटो इहाँ छोड़ीं",
    "Analyzing Road Data... ": "सड़क डेटा के जांच होत बा... ",
    "TICKET:": "टिकट:",
    "Potholes": "गड्ढा सभ",
    "Severity": "गंभीरता",
    "Road:": "सड़क:",
    "Target Completion:": "लक्ष्य समाप्ति:",
    "CONTRACTOR": "ठेकेदार",
    "PROJECT ENGINEER": "प्रोजेक्ट इंजीनियर",
    "Click here to view the location on Google Maps": "Google Maps पर जगह देखे खातिर इहाँ क्लिक करीं",
    "REPORTS LOG": "रिपोर्ट लॉग",
    "TICKETS": "टिकट सभ",
    "No reports generated yet.": "अभी तक कौनो रिपोर्ट ना बनल बा।",
    "Reported:": "रिपोर्ट भईल:",
    "Just now": "अबहीं-अबहीं",
    "Allocated": "बांटल गइल",
    "OPEN": "खुलाल",
    "Location": "जगह",
    "Potholes Detected": "गड्ढा सभ के पता चल्ल",
    "Confirmed by Road Inspector": "सड़क निरीक्षक द्वारा पक्का कइल गइल",
    "Status": "हालत",
    "Change?": "बदलीं?",
    "Operations & Resource Allocation": "संचालन अउर संसाधन आवंटन",
    "Budget Allocation (INR)": "बजट आवंटन (INR)",
    "Repair Deadline": "मरम्मत के आखिरी तारीख",
    "Select a date...": "तारीख चुनीं...",
    "Save Allocations & Deadline": "आवंटन अउर आखिरी तारीख सहेजीं",
    "Confirm Status": "स्थिति पक्का करीं",
    "Are you sure you want to change the status to ": "का रउआ सचहूँ स्थिति के एपर बदले के चाहत बानी: ",
    "Cancel": "रद्द करीं",
    "Confirm": "पक्का करीं",
    "Chat View": "चैट व्यू",
    "Admin View": "एडमिन व्यू",
    "CHAT VIEW": "चैट व्यू",
    "ADMIN VIEW": "एडमिन व्यू",
    "Offline Mode: Site functionality is currently limited.": "ऑफलाइन मोड: साइट के काम अभी सीमित बा।",
    "Localization is unavailable while offline.": "ऑफलाइन रहला पर भाषा के सुविधा ना मिली।",
    "History is unavailable while offline.": "ऑफलाइन रहला पर इतिहास ना दिखी।",
    "User profile is unavailable while offline.": "ऑफलाइन रहला पर प्रोफाइल ना दिखी।",
    "BUDGET ALLOCATED": "बजट मिल गइल",
    "IN PROGRESS": "काम चलत बा",
    "RESOLVED": "सुधार हो गइल",
    "DECLINED": "मना कइल गइल",
    "Only PNG and JPEG files are allowed.": "खाली PNG अउर JPEG फाइल के इजाजत बा।",
    "Only 1 image can be attached at a time.": "एक बार में खाली 1 गो फोटो जोड़ल जा सकेला।",
    "Report updated successfully!": "रिपोर्ट सफलतापूर्वक अपडेट हो गइल!",
    "Failed to update report.": "रिपोर्ट अपडेट करे में गड़बड़ी भईल।",
    "Status update timed out. Please check your connection.": "स्थिति अपडेट के समय समाप्त हो गइल। अपन नेटवर्क जांचीं।",
    "Failed to update status.": "स्थिति अपडेट करे में गड़बड़ी भईल।",
    "Status updated to ": "स्थिति बदल के ई हो गइल बा: ",
    "Failed to load chat history.": "चैट इतिहास लोड करे में गड़बड़ी भईल।",
    "Connection restored! Syncing your data...": "नेटवर्क आ गइल! रउआ डेटा सिंक होत बा...",
    "Ticket counter has been reset to 0.": "टिकट काउंटर 0 पर रीसेट हो गइल बा।",
    "Failed to reset counter.": "काउंटर रीसेट करे में गड़बड़ी भईल।",
    "Offline: Data saved locally. Auto-sync will start when online.": "ऑफलाइन: डेटा इहवें सहेजल गइल। ऑनलाइन भइला पर अपने से सिंक हो जाई।",
    "Groq AI Core Offline: Ensure your Uvicorn server is running on port 8000!": "Groq AI कोर ऑफलाइन बा: पक्का करीं कि रउआ Uvicorn सर्वर पोर्ट 8000 पर चलत होखे!",
    "Could not connect to Krater YOLO Backend": "Krater YOLO बैकएंड से कनेक्ट ना हो पावल",
    "Vision Core Offline: Check your Python YOLO server!": "विज़न कोर ऑफलाइन बा: अपन Python YOLO सर्वर के जांचीं!",
    "Analysis complete! I found ": "जांच पूरा भईल! हमरा ",
    " pothole(s) with ": " गो गड्ढा मिलल बा जेकर गंभीरता ",
    " severity. Ticket ": " बा। टिकट ",
    " created.": " बन गइल बा।",
    "Analysis complete! I didn't find any potholes in this image. No ticket was created, as the road looks clear.": "जांच पूरा भईल! ए फोटो में कौनो गड्ढा ना मिलल। कौनो टिकट ना बनल, काहें से कि सड़क साफ लउकत बा।",
    "Select a report from the log to view details & allocate resources.": "विवरण देखे अउर संसाधन बांटे खातिर लॉग से कौनो रिपोर्ट चुनीं।",
    "Sign-In": "साइन-इन",
    "Register": "रजिस्टर करीं",
    "Username": "उपयोगकर्ता के नाम",
    "Password": "पासवर्ड",
    "Confirm Password": "पासवर्ड पक्का करीं",
    "New User?": "नया उपयोगकर्ता?",
    "Already a User?": "पहले से उपयोगकर्ता बानी?",
    "Location:": "जगह:",
    "Report": "रिपोर्ट करीं",
    "Decline": "मना करीं",
    "Road Inspector": "सड़क निरीक्षक",
    "EST. MATERIAL": "अनुमानित सामग्री",
    "Est. Material": "अनुमानित सामग्री",
    "EST. COST": "अनुमानित लागत",
    "Est. Cost": "अनुमानित लागत",
    "ALLOCATED BUDGET": "आवंटित बजट",
    "Allocated Budget": "आवंटित बजट",
    "sq meters": "वर्ग मीटर",
    "Pending": "बाकी बा",
    "Pending Admin": "एडमिन के लगे बाकी",
    "AI Estimated Budget (INR)": "AI अनुमानित बजट (INR)",
    "Material Required (Asphalt)": "जरूरी सामग्री (अलकतरा)",

  },
  "Rajasthani": {
    "NEW CHAT": "नयी चैट",
    "OFFLINE MODE": "ऑफलाइन मोड",
    "RESET COUNTER": "काउंटर रीसेट करो",
    "DARK MODE?": "डार्क मोड?",
    "LIGHT MODE?": "लाइट मोड?",
    "CHAT HISTORY": "चैट इतिहास",
    "Language": "भाषा",
    "Welcome,": "स्वागत है,",
    "Add another account": "दूजो खातो जोड़ो",
    "Switch Accounts": "खाता बदलो",
    "Sign-Out": "साइन-आउट",
    "Recent Chats": "हाल री चैट",
    "No saved chats yet.": "अज्या तक कोई सहेजी थकी चैट कोनी।",
    "Are you sure you want to clear this history?": "काईं थे साची ही ई इतिहास ने मिटावणो चाहो हो?",
    "This chat will be removed from Chat History.": "आ चैट 'चैट इतिहास' सूं हटा दी जावेली।",
    "No": "कोनी",
    "Yes": "हाँ",
    "Hello": "खम्मा घणी",
    "How can I help you with road safety today?": "आज हूँ सड़क सुरक्षा में थारी कइयां मदद कर सकूँ?",
    "Upload a Photo...": "फोटो अपलोड करो...",
    "Upload a Photo and Describe the Issue...": "फोटो अपलोड करो और समस्या बताओ...",
    "Type a message...": "संदेश टाइप करो...",
    "Drop image to attach to chat": "चैट में जोड़बा सारु फोटो अठे छोड़ो",
    "Analyzing Road Data... ": "सड़क डेटा री जांच हो रही है... ",
    "TICKET:": "टिकट:",
    "Potholes": "खाडा",
    "Severity": "गंभीरता",
    "Road:": "सड़क:",
    "Target Completion:": "समय सीमा:",
    "CONTRACTOR": "ठेकेदार",
    "PROJECT ENGINEER": "प्रोजेक्ट इंजीनियर",
    "Click here to view the location on Google Maps": "Google Maps पर जगह देखबा सारु अठे क्लिक करो",
    "REPORTS LOG": "रिपोर्ट लॉग",
    "TICKETS": "टिकट",
    "No reports generated yet.": "अज्या तक कोई रिपोर्ट कोनी बणी।",
    "Reported:": "रिपोर्ट करीजी:",
    "Just now": "अबार ही",
    "Allocated": "बांट दियो",
    "OPEN": "खुलो",
    "Location": "जगह",
    "Potholes Detected": "खाडा लाद्या",
    "Confirmed by Road Inspector": "सड़क निरीक्षक द्वारा पक्को कर दियो",
    "Status": "स्थिति",
    "Change?": "बदलनो है?",
    "Operations & Resource Allocation": "संचालन और संसाधन आवंटन",
    "Budget Allocation (INR)": "बजट आवंटन (INR)",
    "Repair Deadline": "मरम्मत री आखरी तारीख",
    "Select a date...": "तारीख चुनो...",
    "Save Allocations & Deadline": "आवंटन और आखरी तारीख सहेजो",
    "Confirm Status": "स्थिति पक्की करो",
    "Are you sure you want to change the status to ": "काईं थे साची ही स्थिति ने इण पर बदलणो चाहो हो: ",
    "Cancel": "कैंसिल करो",
    "Confirm": "पक्को करो",
    "Chat View": "चैट व्यू",
    "Admin View": "एडमिन व्यू",
    "CHAT VIEW": "चैट व्यू",
    "ADMIN VIEW": "एडमिन व्यू",
    "Offline Mode: Site functionality is currently limited.": "ऑफलाइन मोड: साइट रो काम अबार सीमित है।",
    "Localization is unavailable while offline.": "ऑफलाइन रहबा पर भाषा री सुविधा कोनी मिले।",
    "History is unavailable while offline.": "ऑफलाइन रहबा पर इतिहास कोनी दीखे।",
    "User profile is unavailable while offline.": "ऑफлайн रहबा पर प्रोफाइल कोनी दीखे।",
    "BUDGET ALLOCATED": "बजट मिल गयो",
    "IN PROGRESS": "काम चाल रेह्यो है",
    "RESOLVED": "सुधार हो गयो",
    "DECLINED": "मना कर दियो",
    "Only PNG and JPEG files are allowed.": "खाली PNG और JPEG फाइल री इजाजत है।",
    "Only 1 image can be attached at a time.": "एक बार में खाली 1 फोटो ही जोड़ सको हो।",
    "Report updated successfully!": "रिपोर्ट सफलतापूर्वक अपडेट हो गी!",
    "Failed to update report.": "रिपोर्ट अपडेट कोनी हो पाई।",
    "Status update timed out. Please check your connection.": "स्थिति अपडेट रो टेम पूरो हो गयो। थारो नेटवर्क जांचो।",
    "Failed to update status.": "स्थिति अपडेट कोनी हो पाई।",
    "Status updated to ": "स्थिति बदल ने आ कर दी है: ",
    "Failed to load chat history.": "चैट इतिहास लोड कोनी हो पायो।",
    "Connection restored! Syncing your data...": "नेटवर्क पाछो आ गयो! थारो डेटा सिंक हो रेह्यो है...",
    "Ticket counter has been reset to 0.": "टिकट काउंटर 0 पर रीसेट कर दियो है।",
    "Failed to reset counter.": "काउंटर रीसेट कोनी हो पायो।",
    "Offline: Data saved locally. Auto-sync will start when online.": "ऑफलाइन: डेटा अठे ही सहेज लियो। ऑनलाइन होता ही अपने आप सिंक हो जावेला।",
    "Groq AI Core Offline: Ensure your Uvicorn server is running on port 8000!": "Groq AI कोर ऑफलाइन है: पक्को करो कि थारो Uvicorn सर्वर पोर्ट 8000 पर चाल रेह्यो है!",
    "Could not connect to Krater YOLO Backend": "Krater YOLO बैकएंड सूं कनेक्ट कोनी हो पायो",
    "Vision Core Offline: Check your Python YOLO server!": "विज़न कोर ऑफलाइन है: थारो Python YOLO सर्वर जांचो!",
    "Analysis complete! I found ": "जांच पूरी हुई! मने ",
    " pothole(s) with ": " खाडा लाद्या है जिण री गंभीरता ",
    " severity. Ticket ": " है। टिकट ",
    " created.": " बण गयो है।",
    "Analysis complete! I didn't find any potholes in this image. No ticket was created, as the road looks clear.": "जांच पूरी हुई! मने इण फोटो में कोई खाडो कोनी लाद्यो। कोई टिकट कोनी बण्यो, क्युकी सड़क साफ दीखे है।",
    "Select a report from the log to view details & allocate resources.": "विगत देखबा और संसाधन बांटबा सारु लॉग सूं कोई रिपोर्ट चुनो।",
    "Sign-In": "साइन-इन",
    "Register": "रजिस्टर करो",
    "Username": "यूजरनेम",
    "Password": "पासवर्ड",
    "Confirm Password": "पासवर्ड पक्को करो",
    "New User?": "नया यूजर हो?",
    "Already a User?": "पेली सूं ही यूजर हो?",
    "Location:": "जगह:",
    "Report": "रिपोर्ट करो",
    "Decline": "मना करो",
    "Road Inspector": "सड़क निरीक्षक",
    "EST. MATERIAL": "अनुमानित सामग्री",
    "Est. Material": "अनुमानित सामग्री",
    "EST. COST": "अनुमानित लागत",
    "Est. Cost": "अनुमानित लागत",
    "ALLOCATED BUDGET": "बजट बांट दियो",
    "Allocated Budget": "बजट बांट दियो",
    "sq meters": "वर्ग मीटर",
    "Pending": "बाकी है",
    "Pending Admin": "एडमिन कणे बाकी",
    "AI Estimated Budget (INR)": "AI अनुमानित बजट (INR)",
    "Material Required (Asphalt)": "जरूरी सामग्री (डामर)",

  },
  "Odia": {
    "NEW CHAT": "ନୂଆ ଚାଟ୍",
    "OFFLINE MODE": "ଅଫଲାଇନ୍ ମୋଡ୍",
    "RESET COUNTER": "କାଉଣ୍ଟର ରିସେଟ୍ କରନ୍ତୁ",
    "DARK MODE?": "ଡାର୍କ ମୋଡ୍?",
    "LIGHT MODE?": "ଲାଇଟ୍ ମୋଡ୍?",
    "CHAT HISTORY": "ଚାଟ୍ ଇତିହାସ",
    "Language": "ଭାଷା",
    "Welcome,": "ସ୍ୱାଗତ,",
    "Add another account": "ଅନ୍ୟ ଏକ ଆକାଉଣ୍ଟ୍ ଯୋଡନ୍ତୁ",
    "Switch Accounts": "ଆକାଉଣ୍ଟ୍ ବଦଳାନ୍ତୁ",
    "Sign-Out": "ସାଇନ୍-ଆଉଟ୍",
    "Recent Chats": "ସାମ୍ପ୍ରତିକ ଚାଟ୍",
    "No saved chats yet.": "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଚାଟ୍ ସେଭ୍ ହୋଇନାହିଁ।",
    "Are you sure you want to clear this history?": "ଆପଣ ନିଶ୍ଚିତ କି ଆପଣ ଏହି ଇତିହାସକୁ ଲିଭାଇବାକୁ ଚାହାଁନ୍ତି?",
    "This chat will be removed from Chat History.": "ଏହି ଚାଟ୍ 'ଚାଟ୍ ଇତିହାସ'ରୁ ହଟାଇ ଦିଆଯିବ।",
    "No": "ନାହିଁ",
    "Yes": "ହଁ",
    "Hello": "ନମସ୍କାର",
    "How can I help you with road safety today?": "ଆଜି ମୁଁ ସଡ଼କ ସୁରକ୍ଷାରେ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
    "Upload a Photo...": "ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ...",
    "Upload a Photo and Describe the Issue...": "ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ ଏବଂ ସମସ୍ୟାର ବର୍ଣ୍ଣନା କରନ୍ତୁ...",
    "Type a message...": "ବାର୍ତ୍ତା ଟାଇପ୍ କରନ୍ତୁ...",
    "Drop image to attach to chat": "ଚାଟ୍‌ରେ ଯୋଡ଼ିବା ପାଇଁ ଫଟୋକୁ ଏଠାରେ ଛାଡ଼ନ୍ତୁ",
    "Analyzing Road Data... ": "ରାସ୍ତା ଡାଟାର ବିଶ୍ଳେଷଣ ଚାଲିଛି... ",
    "TICKET:": "ଟିକେଟ୍:",
    "Potholes": "ଖାଲଖମା",
    "Severity": "ଗମ୍ଭୀରତା",
    "Road:": "ରାସ୍ତା:",
    "Target Completion:": "ଲକ୍ଷ୍ୟ ସମାପ୍ତି:",
    "CONTRACTOR": "ଠିକାଦାର",
    "PROJECT ENGINEER": "ପ୍ରୋଜେକ୍ଟ ଇଞ୍ଜିନିୟର",
    "Click here to view the location on Google Maps": "Google Maps ରେ ସ୍ଥାନ ଦେଖିବା ପାଇଁ ଏଠାରେ କ୍ଲିକ୍ କରନ୍ତୁ",
    "REPORTS LOG": "ରିପୋର୍ଟ ଲଗ୍",
    "TICKETS": "ଟିକେଟ୍ ଗୁଡ଼ିକ",
    "No reports generated yet.": "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ରିପୋର୍ଟ ପ୍ରସ୍ତୁତ ହୋଇନାହିଁ।",
    "Reported:": "ରିପୋର୍ଟ ହୋଇଛି:",
    "Just now": "ଏବେ ହିଁ",
    "Allocated": "ଆବଣ୍ଟିତ",
    "OPEN": "ଖୋଲା",
    "Location": "ସ୍ଥାନ",
    "Potholes Detected": "ଖାଲଖମା ଚିହ୍ନଟ ହୋଇଛି",
    "Confirmed by Road Inspector": "ରାସ୍ତା ନିରୀକ୍ଷକଙ୍କ ଦ୍ୱାରା ନିଶ୍ଚିତ ହୋଇଛି",
    "Status": "ସ୍ଥିତି",
    "Change?": "ବଦଳାଇବେ?",
    "Operations & Resource Allocation": "ପରିଚାଳନା ଏବଂ ସମ୍ବଳ ଆବଣ୍ଟନ",
    "Budget Allocation (INR)": "ବଜେଟ୍ ଆବଣ୍ଟନ (INR)",
    "Repair Deadline": "ମରାମତି ସମୟ ସୀମା",
    "Select a date...": "ତାରିଖ ବାଛନ୍ତୁ...",
    "Save Allocations & Deadline": "ଆବଣ୍ଟନ ଏବଂ ସମୟ ସୀମା ସେଭ୍ କରନ୍ତୁ",
    "Confirm Status": "ସ୍ଥିତି ନିଶ୍ଚିତ କରନ୍ତୁ",
    "Are you sure you want to change the status to ": "ଆପଣ ନିଶ୍ଚିତ କି ସ୍ଥିତିକୁ ଏଥିରେ ବଦଳାଇବାକୁ ଚାହାଁନ୍ତି: ",
    "Cancel": "ବାତିଲ୍ କରନ୍ତୁ",
    "Confirm": "ନିଶ୍ଚିତ କରନ୍ତୁ",
    "Chat View": "ଚାଟ୍ ଦୃଶ୍ୟ",
    "Admin View": "ପ୍ରଶାସକ ଦୃଶ୍ୟ",
    "CHAT VIEW": "ଚାଟ୍ ଦୃଶ୍ୟ",
    "ADMIN VIEW": "ପ୍ରଶାସକ ଦୃଶ୍ୟ",
    "Offline Mode: Site functionality is currently limited.": "ଅଫଲାଇନ୍ ମୋଡ୍: ସାଇଟ୍‌ର କାର୍ଯ୍ୟକାରିତା ବର୍ତ୍ତମାନ ସୀମିତ ଅଛି।",
    "Localization is unavailable while offline.": "ଅଫଲାଇନ୍ ଥିବାବେଳେ ସ୍ଥାନୀୟକରଣ ଅନୁପଲବ୍ଧ।",
    "History is unavailable while offline.": "ଅଫଲାଇନ୍ ଥିବାବେଳେ ଇତିହାସ ଅନୁପଲବ୍ଧ।",
    "User profile is unavailable while offline.": "ଅଫଲାଇନ୍ ଥିବାବେଳେ ଉପଭୋକ୍ତା ପ୍ରୋଫାଇଲ୍ ଅନୁପଲବ୍ଧ।",
    "BUDGET ALLOCATED": "ବଜେଟ୍ ଆବଣ୍ଟିତ",
    "IN PROGRESS": "କାର୍ଯ୍ୟ ଚାଲିଛି",
    "RESOLVED": "ସମାଧାନ ହୋଇଛି",
    "DECLINED": "ପ୍ରତ୍ୟାଖ୍ୟାତ",
    "Only PNG and JPEG files are allowed.": "କେବଳ PNG ଏବଂ JPEG ଫାଇଲ୍ ପାଇଁ ଅନୁମତି ଅଛି।",
    "Only 1 image can be attached at a time.": "ଏକ ସମୟରେ କେବଳ ୧ଟି ଫଟୋ ଯୋଡ଼ାଯାଇପାରିବ।",
    "Report updated successfully!": "ରିପୋର୍ଟ ସଫଳତାର ସହ ଅପଡେଟ୍ ହୋଇଛି!",
    "Failed to update report.": "ରିପୋର୍ଟ ଅପଡେଟ୍ କରିବାରେ ବିଫଳ।",
    "Status update timed out. Please check your connection.": "ସ୍ଥିତି ଅପଡେଟ୍ ସମୟ ସମାପ୍ତ। ଦୟାକରି ଆପଣଙ୍କର ସଂଯୋଗ ଯାଞ୍ଚ କରନ୍ତୁ।",
    "Failed to update status.": "ସ୍ଥିତି ଅପଡେଟ୍ କରିବାରେ ବିଫଳ।",
    "Status updated to ": "ସ୍ଥିତି ବଦଳାଯାଇ ଏହା କରାଯାଇଛି: ",
    "Failed to load chat history.": "ଚାଟ୍ ଇତିହାସ ଲୋଡ୍ କରିବାରେ ବିଫଳ।",
    "Connection restored! Syncing your data...": "ସଂଯୋଗ ପୁନଃସ୍ଥାପିତ ହେଲା! ଆପଣଙ୍କର ଡାଟା ସିଙ୍କ୍ ହେଉଛି...",
    "Ticket counter has been reset to 0.": "ଟିକେଟ୍ କାଉଣ୍ଟର 0 କୁ ରିସେଟ୍ କରାଯାଇଛି।",
    "Failed to reset counter.": "କାଉଣ୍ଟର ରିସେଟ୍ କରିବାରେ ବିଫଳ।",
    "Offline: Data saved locally. Auto-sync will start when online.": "ଅଫଲାଇନ୍: ଡାଟା ସ୍ଥାନୀୟ ଭାବରେ ସେଭ୍ ହେଲା। ଅନଲାଇନ୍ ହେଲେ ଅଟୋ-ସିଙ୍କ୍ ଆରମ୍ଭ ହେବ।",
    "Groq AI Core Offline: Ensure your Uvicorn server is running on port 8000!": "Groq AI କୋର୍ ଅଫଲାଇନ୍: ନିଶ୍ଚିତ କରନ୍ତୁ ଯେ ଆପଣଙ୍କର Uvicorn ସର୍ଭର ପୋର୍ଟ 8000 ରେ ଚାଲୁଛି!",
    "Could not connect to Krater YOLO Backend": "Krater YOLO ବ୍ୟାକଏଣ୍ଡ ସହିତ ସଂଯୋଗ ହୋଇପାରିଲା ନାହିଁ",
    "Vision Core Offline: Check your Python YOLO server!": "ଭିଜନ୍ କୋର୍ ଅଫଲାଇନ୍: ଆପଣଙ୍କର Python YOLO ସର୍ଭର ଯାଞ୍ଚ କରନ୍ତୁ!",
    "Analysis complete! I found ": "ବିଶ୍ଳେଷଣ ସମାପ୍ତ! ମୁଁ ପାଇଲି ",
    " pothole(s) with ": " ଟି ଖାଲ ଯାହାର ଗମ୍ଭୀରତା ",
    " severity. Ticket ": " ଅଟେ। ଟିକେଟ୍ ",
    " created.": " ସୃଷ୍ଟି କରାଯାଇଛି।",
    "Analysis complete! I didn't find any potholes in this image. No ticket was created, as the road looks clear.": "ବିଶ୍ଳେଷଣ ସମାପ୍ତ! ଏହି ଫଟୋରେ କୌଣସି ଖାଲ ମିଳିଲା ନାହିଁ। କୌଣସି ଟିକେଟ୍ ସୃଷ୍ଟି କରାଯାଇ ନାହିଁ, କାରଣ ରାସ୍ତା ସଫା ଦେଖାଯାଉଛି।",
    "Select a report from the log to view details & allocate resources.": "ବିବରଣୀ ଦେଖିବା ଏବଂ ସମ୍ବଳ ଆବଣ୍ଟନ କରିବା ପାଇଁ ଲଗ୍‌ରୁ ଏକ ରିପୋର୍ଟ ବାଛନ୍ତୁ।",
    "Sign-In": "ସାଇନ୍-ଇନ୍",
    "Register": "ପଞ୍ଜୀକରଣ କରନ୍ତୁ",
    "Username": "ଉପଭୋକ୍ତା ନାମ",
    "Password": "ପାସୱାର୍ଡ",
    "Confirm Password": "ପାସୱାର୍ଡ ନିଶ୍ଚିତ କରନ୍ତୁ",
    "New User?": "ନୂଆ ଉପଭୋକ୍ତା କି?",
    "Already a User?": "ପୂର୍ବରୁ ଉପଭୋକ୍ତା ଅଛନ୍ତି କି?",
    "Location:": "ସ୍ଥାନ:",
    "Report": "ରିପୋର୍ଟ କରନ୍ତୁ",
    "Decline": "ପ୍ରତ୍ୟାଖ୍ୟାନ କରନ୍ତୁ",
    "Road Inspector": "ରାସ୍ତା ନିରୀକ୍ଷକ",
    "EST. MATERIAL": "ଆନୁମାନିକ ସାମଗ୍ରୀ",
    "Est. Material": "ଆନୁମାନିକ ସାମଗ୍ରୀ",
    "EST. COST": "ଆନୁମାନିକ ଖର୍ଚ୍ଚ",
    "Est. Cost": "ଆନୁମାନିକ ଖର୍ଚ୍ଚ",
    "ALLOCATED BUDGET": "ଆବଣ୍ଟିତ ବଜେଟ୍",
    "Allocated Budget": "ଆବଣ୍ଟିତ ବଜେଟ୍",
    "sq meters": "ବର୍ଗ ମିଟର",
    "Pending": "ବିଚାରାଧୀନ",
    "Pending Admin": "ପ୍ରଶାସକଙ୍କ ନିକଟରେ ବିଚାରାଧୀନ",
    "AI Estimated Budget (INR)": "AI ଆନୁମାନିକ ବଜେଟ୍ (INR)",
    "Material Required (Asphalt)": "ଆବଶ୍ୟକ ସାମଗ୍ରୀ (ପିଚୁ)",

  },
  "Telugu": {
    "NEW CHAT": "కొత్త చాట్",
    "OFFLINE MODE": "ఆఫ్‌లైన్ మోడ్",
    "RESET COUNTER": "కౌంటర్‌ను రీసెట్ చేయండి",
    "DARK MODE?": "డార్క్ మోడ్?",
    "LIGHT MODE?": "లైట్ మోడ్?",
    "CHAT HISTORY": "చాట్ చరిత్ర",
    "Language": "భాష",
    "Welcome,": "స్వాగతం,",
    "Add another account": "మరొక ఖాతాను జోడించండి",
    "Switch Accounts": "ఖాతాలను మార్చండి",
    "Sign-Out": "సైన్-అవుట్",
    "Recent Chats": "ఇటీవలి చాట్‌లు",
    "No saved chats yet.": "ఇంకా సేవ్ చేసిన చాట్‌లు లేవు.",
    "Are you sure you want to clear this history?": "మీరు ఖచ్చితంగా ఈ చరిత్రను తొలగించాలనుకుంటున్నారా?",
    "This chat will be removed from Chat History.": "ఈ చాట్ 'చాట్ చరిత్ర' నుండి తీసివేయబడుతుంది.",
    "No": "కాదు",
    "Yes": "అవును",
    "Hello": "నమస్తే",
    "How can I help you with road safety today?": "ఈ రోజు రోడ్డు భద్రతకు సంబంధించి నేను మీకు ఎలా సహాయం చేయగలను?",
    "Upload a Photo...": "ఫోటోను అప్‌లోడ్ చేయండి...",
    "Upload a Photo and Describe the Issue...": "ఫోటోను అప్‌లోడ్ చేసి, సమస్యను వివరించండి...",
    "Type a message...": "సందేశాన్ని టైప్ చేయండి...",
    "Drop image to attach to chat": "చాట్‌కు జోడించడానికి చిత్రాన్ని ఇక్కడ వదలండి",
    "Analyzing Road Data... ": "రోడ్డు డేటాను విశ్లేషిస్తోంది... ",
    "TICKET:": "టికెట్:",
    "Potholes": "గోతులు",
    "Severity": "తీవ్రత",
    "Road:": "రోడ్డు:",
    "Target Completion:": "గడువు ముగింపు:",
    "CONTRACTOR": "కాంట్రాక్టర్",
    "PROJECT ENGINEER": "ప్రాజెక్ట్ ఇంజనీర్",
    "Click here to view the location on Google Maps": "Google Maps లో స్థానాన్ని చూడటానికి ఇక్కడ క్లిక్ చేయండి",
    "REPORTS LOG": "నివేదికల లాగ్",
    "TICKETS": "టికెట్లు",
    "No reports generated yet.": "ఇంకా ఎలాంటి నివేదికలు రూపొందించబడలేదు.",
    "Reported:": "నివేదించబడింది:",
    "Just now": "ఇప్పుడే",
    "Allocated": "కేటాయించబడింది",
    "OPEN": "ఓపెన్",
    "Location": "స్థానం",
    "Potholes Detected": "గోతులు గుర్తించబడ్డాయి",
    "Confirmed by Road Inspector": "రోడ్డు ఇన్‌స్పెక్టర్ ధృవీకరించారు",
    "Status": "స్థితి",
    "Change?": "మార్చాలా?",
    "Operations & Resource Allocation": "కార్యకలాపాలు & వనరుల కేటాయింపు",
    "Budget Allocation (INR)": "బడ్జెట్ కేటాయింపు (INR)",
    "Repair Deadline": "మరమ్మత్తు గడువు",
    "Select a date...": "తేదీని ఎంచుకోండి...",
    "Save Allocations & Deadline": "కేటాయింపులు & గడువును సేవ్ చేయండి",
    "Confirm Status": "స్థితిని ధృవీకరించండి",
    "Are you sure you want to change the status to ": "మీరు ఖచ్చితంగా స్థితిని దీనికి మార్చాలనుకుంటున్నారా: ",
    "Cancel": "రద్దు చేయి",
    "Confirm": "ధృవీకరించు",
    "Chat View": "చాట్ వీక్షణ",
    "Admin View": "అడ్మిన్ వీక్షణ",
    "CHAT VIEW": "చాట్ వీక్షణ",
    "ADMIN VIEW": "అడ్మిన్ వీక్షణ",
    "Offline Mode: Site functionality is currently limited.": "ఆఫ్‌లైన్ మోడ్: సైట్ కార్యాచరణ ప్రస్తుతం పరిమితంగా ఉంది.",
    "Localization is unavailable while offline.": "ఆఫ్‌లైన్‌లో ఉన్నప్పుడు స్థానీకరణ అందుబాటులో ఉండదు.",
    "History is unavailable while offline.": "ఆఫ్‌లైన్‌లో ఉన్నప్పుడు చరిత్ర అందుబాటులో ఉండదు.",
    "User profile is unavailable while offline.": "ఆఫ్‌లైన్‌లో ఉన్నప్పుడు వినియోగదారు ప్రొఫైల్ అందుబాటులో ఉండదు.",
    "BUDGET ALLOCATED": "బడ్జెట్ కేటాయించబడింది",
    "IN PROGRESS": "ప్రగతిలో ఉంది",
    "RESOLVED": "పరిష్కరించబడింది",
    "DECLINED": "తిరస్కరించబడింది",
    "Only PNG and JPEG files are allowed.": "PNG మరియు JPEG ఫైల్‌లు మాత్రమే అనుమతించబడతాయి.",
    "Only 1 image can be attached at a time.": "ఒకసారి ఒక చిత్రాన్ని మాత్రమే జోడించగలరు.",
    "Report updated successfully!": "నివేదిక విజయవంతంగా నవీకరించబడింది!",
    "Failed to update report.": "నివేదికను నవీకరించడంలో విఫలమైంది.",
    "Status update timed out. Please check your connection.": "స్థితి నవీకరణ సమయం ముగిసింది. దయచేసి మీ కనెక్షన్‌ని తనిఖీ చేయండి.",
    "Failed to update status.": "స్థితిని నవీకరించడంలో విఫలమైంది.",
    "Status updated to ": "స్థితి దీనికి నవీకరించబడింది: ",
    "Failed to load chat history.": "చాట్ చరిత్రను లోడ్ చేయడంలో విఫలమైంది.",
    "Connection restored! Syncing your data...": "కనెక్షన్ పునరుద్ధరించబడింది! మీ డేటా సమకాలీకరించబడుతోంది...",
    "Ticket counter has been reset to 0.": "టికెట్ కౌంటర్ 0 కి రీసెట్ చేయబడింది.",
    "Failed to reset counter.": "కౌంటర్‌ను రీసెట్ చేయడంలో విఫలమైంది.",
    "Offline: Data saved locally. Auto-sync will start when online.": "ఆఫ్‌లైన్: డేటా స్థానికంగా సేవ్ చేయబడింది. ఆన్‌లైన్‌కి రాగానే ఆటో-సమకాలీకరణ ప్రారంభమవుతుంది.",
    "Groq AI Core Offline: Ensure your Uvicorn server is running on port 8000!": "Groq AI కోర్ ఆఫ్‌లైన్: మీ Uvicorn సర్వర్ పోర్ట్ 8000 పై రన్ అవుతుందని నిర్ధారించుకోండి!",
    "Could not connect to Krater YOLO Backend": "Krater YOLO బ్యాకెండ్‌కు కనెక్ట్ కాలేదు",
    "Vision Core Offline: Check your Python YOLO server!": "విజన్ కోర్ ఆఫ్‌లైన్: మీ Python YOLO సర్వర్‌ని తనిఖీ చేయండి!",
    "Analysis complete! I found ": "విశ్లేషణ పూర్తయింది! నాకు ",
    " pothole(s) with ": " గోతులు కనిపించాయి, వాటి తీవ్రత ",
    " severity. Ticket ": " గా ఉంది. టికెట్ ",
    " created.": " సృష్టించబడింది.",
    "Analysis complete! I didn't find any potholes in this image. No ticket was created, as the road looks clear.": "విశ్లేషణ పూర్తయింది! ఈ చిత్రంలో నాకు ఎలాంటి గోతులు కనిపించలేదు. రోడ్డు స్పష్టంగా ఉన్నందున ఎలాంటి టికెట్ సృష్టించబడలేదు.",
    "Select a report from the log to view details & allocate resources.": "వివరాలను వీక్షించడానికి మరియు వనరులను కేటాయించడానికి లాగ్ నుండి ఒక నివేదికను ఎంచుకోండి.",
    "Sign-In": "సైన్-ఇన్",
    "Register": "నమోదు చేసుకోండి",
    "Username": "వినియోగదారు పేరు",
    "Password": "పాస్‌వర్డ్",
    "Confirm Password": "పాస్‌వర్డ్‌ను ధృవీకరించండి",
    "New User?": "కొత్త వినియోగదారా?",
    "Already a User?": "ఇప్పటికే వినియోగదారా?",
    "Location:": "స్థానం:",
    "Report": "నివేదించు",
    "Decline": "తిరస్కరించు",
    "Road Inspector": "రోడ్డు ఇన్‌స్పెక్టర్",
    "EST. MATERIAL": "అంచనా వేసిన మెటీరియల్",
    "Est. Material": "అంచనా వేసిన మెటీరియల్",
    "EST. COST": "అంచనా వ్యయం",
    "Est. Cost": "అంచనా వ్యయం",
    "ALLOCATED BUDGET": "కేటాయించిన బడ్జెట్",
    "Allocated Budget": "కేటాయించిన బడ్జెట్",
    "sq meters": "చదరపు మీటర్లు",
    "Pending": "పెండింగ్",
    "Pending Admin": "అడ్మిన్ పెండింగ్",
    "AI Estimated Budget (INR)": "AI అంచనా వేసిన బడ్జెట్ (INR)",
    "Material Required (Asphalt)": "అవసరమైన మెటీరియల్ (తారు)",

  },
  "Tamil": {
    "NEW CHAT": "புதிய சாட்",
    "OFFLINE MODE": "ஆஃப்லைன் பயன்முறை",
    "RESET COUNTER": "கவுண்டரை மீட்டமைக்கவும்",
    "DARK MODE?": "டார்க் மோட்?",
    "LIGHT MODE?": "லைட் மோட்?",
    "CHAT HISTORY": "சாட் வரலாறு",
    "Language": "மொழி",
    "Welcome,": "வரவேற்கிறோம்,",
    "Add another account": "மற்றொரு கணக்கைச் சேர்க்கவும்",
    "Switch Accounts": "கணக்குகளை மாற்றவும்",
    "Sign-Out": "சைன்-அவுட்",
    "Recent Chats": "சமீபத்திய சாட்கள்",
    "No saved chats yet.": "இன்னும் சாட்கள் எதுவும் சேமிக்கப்படவில்லை.",
    "Are you sure you want to clear this history?": "நிச்சயமாக இந்த வரலாற்றை அழிக்க வேண்டுமா?",
    "This chat will be removed from Chat History.": "இந்த சாட் 'சாட் வரலாற்றில்' இருந்து நீக்கப்படும்.",
    "No": "இல்லை",
    "Yes": "ஆம்",
    "Hello": "வணக்கம்",
    "How can I help you with road safety today?": "இன்று சாலை பாதுகாப்பு குறித்து நான் உங்களுக்கு எவ்வாறு உதவலாம்?",
    "Upload a Photo...": "புகைப்படத்தைப் பதிவேற்றவும்...",
    "Upload a Photo and Describe the Issue...": "புகைப்படத்தைப் பதிவேற்றி, சிக்கலை விவரிக்கவும்...",
    "Type a message...": "செய்தியை தட்டச்சு செய்யவும்...",
    "Drop image to attach to chat": "சாட்டில் இணைக்க படத்தை இங்கே போடவும்",
    "Analyzing Road Data... ": "சாலைத் தரவு பகுப்பாய்வு செய்யப்படுகிறது... ",
    "TICKET:": "டிக்கெட்:",
    "Potholes": "பள்ளங்கள்",
    "Severity": "தீவிரம்",
    "Road:": "சாலை:",
    "Target Completion:": "இலக்கு முடிவு:",
    "CONTRACTOR": "ஒப்பந்ததாரர்",
    "PROJECT ENGINEER": "திட்ட பொறியாளர்",
    "Click here to view the location on Google Maps": "Google Maps இல் இருப்பிடத்தைக் காண இங்கே கிளிக் செய்யவும்",
    "REPORTS LOG": "அறிக்கைப் பதிவு",
    "TICKETS": "டிக்கெட்டுகள்",
    "No reports generated yet.": "இதுவரை அறிக்கைகள் எதுவும் உருவாக்கப்படவில்லை.",
    "Reported:": "அறிவிக்கப்பட்டது:",
    "Just now": "இப்போதுதான்",
    "Allocated": "ஒதுக்கப்பட்டது",
    "OPEN": "திறந்துள்ளது",
    "Location": "இருப்பிடம்",
    "Potholes Detected": "பள்ளங்கள் கண்டறியப்பட்டன",
    "Confirmed by Road Inspector": "சாலை ஆய்வாளரால் உறுதிப்படுத்தப்பட்டது",
    "Status": "நிலை",
    "Change?": "மாற்ற வேண்டுமா?",
    "Operations & Resource Allocation": "செயல்பாடுகள் மற்றும் வள ஒதுக்கீடு",
    "Budget Allocation (INR)": "பட்ஜெட் ஒதுக்கீடு (INR)",
    "Repair Deadline": "பழுதுபார்க்கும் காலக்கெடு",
    "Select a date...": "தேதியைத் தேர்ந்தெடுக்கவும்...",
    "Save Allocations & Deadline": "ஒதுக்கீடு மற்றும் காலக்கெடுவைச் சேமிக்கவும்",
    "Confirm Status": "நிலையை உறுதிப்படுத்தவும்",
    "Are you sure you want to change the status to ": "நிச்சயமாக நிலையை இதற்கு மாற்ற வேண்டுமா: ",
    "Cancel": "ரத்துசெய்",
    "Confirm": "உறுதிசெய்",
    "Chat View": "சாட் காட்சி",
    "Admin View": "நிர்வாகக் காட்சி",
    "CHAT VIEW": "சாட் காட்சி",
    "ADMIN VIEW": "நிர்வாகக் காட்சி",
    "Offline Mode: Site functionality is currently limited.": "ஆஃப்லைன் பயன்முறை: தளத்தின் செயல்பாடுகள் தற்போது வரையறுக்கப்பட்டுள்ளன.",
    "Localization is unavailable while offline.": "ஆஃப்லைனில் இருக்கும்போது மொழியாக்கம் கிடைக்காது.",
    "History is unavailable while offline.": "ஆஃப்லைனில் இருக்கும்போது வரலாறு கிடைக்காது.",
    "User profile is unavailable while offline.": "ஆஃப்லைனில் இருக்கும்போது பயனர் சுயவிவரம் கிடைக்காது.",
    "BUDGET ALLOCATED": "பட்ஜெட் ஒதுக்கப்பட்டது",
    "IN PROGRESS": "செயல்பாட்டில் உள்ளது",
    "RESOLVED": "தீர்வு காணப்பட்டது",
    "DECLINED": "நிராகரிக்கப்பட்டது",
    "Only PNG and JPEG files are allowed.": "PNG மற்றும் JPEG கோப்புகள் மட்டுமே அனுமதிக்கப்படும்.",
    "Only 1 image can be attached at a time.": "ஒரு நேரத்தில் 1 படத்தை மட்டுமே இணைக்க முடியும்.",
    "Report updated successfully!": "அறிக்கை வெற்றிகரமாக புதுப்பிக்கப்பட்டது!",
    "Failed to update report.": "அறிக்கையைப் புதுப்பிக்கத் தவறியது.",
    "Status update timed out. Please check your connection.": "நிலை புதுப்பிப்புக்கான நேரம் முடிந்தது. உங்கள் இணைப்பைச் சரிபார்க்கவும்.",
    "Failed to update status.": "நிலையைப் புதுப்பிக்கத் தவறியது.",
    "Status updated to ": "நிலை இவ்வாறு புதுப்பிக்கப்பட்டது: ",
    "Failed to load chat history.": "சாட் வரலாற்றை ஏற்றுவதில் தோல்வி.",
    "Connection restored! Syncing your data...": "இணைப்பு மீட்டமைக்கப்பட்டது! உங்கள் தரவு ஒத்திசைக்கப்படுகிறது...",
    "Ticket counter has been reset to 0.": "டிக்கெட் கவுண்டர் 0 ஆக மீட்டமைக்கப்பட்டது.",
    "Failed to reset counter.": "கவுண்டரை மீட்டமைக்கத் தவறியது.",
    "Offline: Data saved locally. Auto-sync will start when online.": "ஆஃப்லைன்: தரவு உள்நாட்டில் சேமிக்கப்பட்டது. ஆன்லைனுக்கு வந்ததும் தானியங்கு ஒத்திசைவு தொடங்கும்.",
    "Groq AI Core Offline: Ensure your Uvicorn server is running on port 8000!": "Groq AI கோர் ஆஃப்லைன்: உங்கள் Uvicorn சர்வர் போர்ட் 8000 இல் இயங்குவதை உறுதிசெய்யவும்!",
    "Could not connect to Krater YOLO Backend": "Krater YOLO பேக்எண்டுடன் இணைக்க முடியவில்லை",
    "Vision Core Offline: Check your Python YOLO server!": "விஷன் கோர் ஆஃப்லைன்: உங்கள் Python YOLO சர்வரைச் சரிபார்க்கவும்!",
    "Analysis complete! I found ": "பகுப்பாய்வு முடிந்தது! எனக்கு ",
    " pothole(s) with ": " பள்ளங்கள் கிடைத்துள்ளன, அதன் தீவிரம் ",
    " severity. Ticket ": " ஆகும். டிக்கெட் ",
    " created.": " உருவாக்கப்பட்டது.",
    "Analysis complete! I didn't find any potholes in this image. No ticket was created, as the road looks clear.": "பகுப்பாய்வு முடிந்தது! இந்தப் படத்தில் பள்ளங்கள் எதுவும் காணப்படவில்லை. சாலை தெளிவாக இருப்பதால் டிக்கெட் எதுவும் உருவாக்கப்படவில்லை.",
    "Select a report from the log to view details & allocate resources.": "விவரங்களைக் காணவும் வளங்களை ஒதுக்கவும் பதிவிலிருந்து ஓர் அறிக்கையைத் தேர்ந்தெடுக்கவும்.",
    "Sign-In": "சைன்-இன்",
    "Register": "பதிவு செய்யவும்",
    "Username": "பயனர் பெயர்",
    "Password": "கடவுச்சொல்",
    "Confirm Password": "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    "New User?": "புதிய பயனரா?",
    "Already a User?": "ஏற்கனவே பயனரா?",
    "Location:": "இருப்பிடம்:",
    "Report": "புகார் செய்",
    "Decline": "நிராகரி",
    "Road Inspector": "சாலை ஆய்வாளர்",
    "EST. MATERIAL": "மதிப்பிடப்பட்ட பொருள்",
    "Est. Material": "மதிப்பிடப்பட்ட பொருள்",
    "EST. COST": "மதிப்பிடப்பட்ட செலவு",
    "Est. Cost": "மதிப்பிடப்பட்ட செலவு",
    "ALLOCATED BUDGET": "ஒதுக்கப்பட்ட பட்ஜெட்",
    "Allocated Budget": "ஒதுக்கப்பட்ட பட்ஜெட்",
    "sq meters": "சதுர மீட்டர்",
    "Pending": "நிலுவையில் உள்ளது",
    "Pending Admin": "நிர்வாகி ஒப்புதலுக்கு நிலுவையில் உள்ளது",
    "AI Estimated Budget (INR)": "AI மதிப்பிட்ட பட்ஜெட் (INR)",
    "Material Required (Asphalt)": "தேவைப்படும் பொருள் (தார்)",

  },
  Hindi: {
    "NEW CHAT": "नई चैट",
    "OFFLINE MODE": "ऑफ़लाइन मोड",
    "RESET COUNTER": "काउंटर रीसेट करें",
    "DARK MODE?": "डार्क मोड?",
    "LIGHT MODE?": "लाइट मोड?",
    "CHAT HISTORY": "चैट इतिहास",
    "Language": "भाषा",
    "Welcome,": "स्वागत है,",
    "Add another account": "दूसरा खाता जोड़ें",
    "Switch Accounts": "खाते बदलें",
    "Sign-Out": "साइन-आउट",
    "Recent Chats": "हाल की चैट",
    "No saved chats yet.": "अभी तक कोई सहेजी गई चैट नहीं।",
    "Are you sure you want to clear this history?": "क्या आप वाकई इस इतिहास को मिटाना चाहते हैं?",
    "This chat will be removed from Chat History.": "यह चैट 'चैट इतिहास' से हटा दी जाएगी।",
    "No": "नहीं",
    "Yes": "हाँ",
    "Hello": "नमस्ते",
    "How can I help you with road safety today?": "आज मैं सड़क सुरक्षा में आपकी कैसे मदद कर सकता हूँ?",
    "Upload a Photo...": "फोटो अपलोड करें...",
    "Upload a Photo and Describe the Issue...": "फोटो अपलोड करें और समस्या का वर्णन करें...",
    "Type a message...": "संदेश टाइप करें...",
    "Drop image to attach to chat": "चैट में जोड़ने के लिए छवि यहाँ छोड़ें",
    "Analyzing Road Data... ": "सड़क डेटा का विश्लेषण हो रहा है... ",
    "TICKET:": "टिकट:",
    "Potholes": "गड्ढे",
    "Severity": "गंभीरता",
    "Road:": "सड़क:",
    "Target Completion:": "लक्ष्य समाप्ति:",
    "CONTRACTOR": "ठेकेदार",
    "PROJECT ENGINEER": "प्रोजेक्ट इंजीनियर",
    "Click here to view the location on Google Maps": "Google Maps पर स्थान देखने के लिए यहाँ क्लिक करें",
    "REPORTS LOG": "रिपोर्ट लॉग",
    "TICKETS": "टिकट",
    "No reports generated yet.": "अभी तक कोई रिपोर्ट जनरेट नहीं हुई है।",
    "Reported:": "रिपोर्ट किया गया:",
    "Just now": "अभी-अभी",
    "Allocated": "आवंटित",
    "OPEN": "खुला",
    "Location": "स्थान",
    "Potholes Detected": "गड्ढों का पता चला",
    "Confirmed by Road Inspector": "सड़क निरीक्षक द्वारा पुष्टि की गई",
    "Status": "स्थिति",
    "Change?": "बदलें?",
    "Operations & Resource Allocation": "संचालन और संसाधन आवंटन",
    "Budget Allocation (INR)": "बजट आवंटन (INR)",
    "Repair Deadline": "मरम्मत की समय सीमा",
    "Select a date...": "तारीख चुनें...",
    "Save Allocations & Deadline": "आवंटन और समय सीमा सहेजें",
    "Confirm Status": "स्थिति की पुष्टि करें",
    "Are you sure you want to change the status to ": "क्या आप वाकई स्थिति को इस पर बदलना चाहते हैं: ",
    "Cancel": "रद्द करें",
    "Confirm": "पुष्टि करें",
    "Chat View": "चैट दृश्य",
    "Admin View": "व्यवस्थापक दृश्य",
    "CHAT VIEW": "चैट दृश्य",
    "ADMIN VIEW": "व्यवस्थापक दृश्य",
    "Offline Mode: Site functionality is currently limited.": "ऑफ़लाइन मोड: साइट की कार्यक्षमता वर्तमान में सीमित है।",
    "Localization is unavailable while offline.": "ऑफ़लाइन होने पर स्थानीयकरण अनुपलब्ध है।",
    "History is unavailable while offline.": "ऑफ़लाइन होने पर इतिहास अनुपलब्ध है।",
    "User profile is unavailable while offline.": "ऑफ़लाइन होने पर उपयोगकर्ता प्रोफ़ाइल अनुपलब्ध है।",
    "OPEN": "खुला",
    "BUDGET ALLOCATED": "बजट आवंटित",
    "IN PROGRESS": "प्रगति पर",
    "RESOLVED": "समाधान किया गया",
    "DECLINED": "अस्वीकृत",
    "Only PNG and JPEG files are allowed.": "केवल PNG और JPEG फ़ाइलें ही अनुमत हैं।",
    "Only 1 image can be attached at a time.": "एक बार में केवल 1 छवि ही जोड़ी जा सकती है।",
    "Report updated successfully!": "रिपोर्ट सफलतापूर्वक अपडेट की गई!",
    "Failed to update report.": "रिपोर्ट अपडेट करने में विफल।",
    "Status update timed out. Please check your connection.": "स्थिति अपडेट का समय समाप्त हो गया। कृपया अपना कनेक्शन जांचें।",
    "Failed to update status.": "स्थिति अपडेट करने में विफल।",
    "Status updated to ": "स्थिति को बदलकर यह कर दिया गया है: ",
    "Failed to load chat history.": "चैट इतिहास लोड करने में विफल।",
    "Localization is unavailable while offline.": "ऑफ़लाइन होने पर स्थानीयकरण अनुपलब्ध है।",
    "History is unavailable while offline.": "ऑफ़लाइन होने पर इतिहास अनुपलब्ध है।",
    "User profile is unavailable while offline.": "ऑफ़लाइन होने पर उपयोगकर्ता प्रोफ़ाइल अनुपलब्ध है।",
    "Connection restored! Syncing your data...": "कनेक्शन बहाल हो गया! आपका डेटा सिंक हो रहा है...",
    "Ticket counter has been reset to 0.": "टिकट काउंटर 0 पर रीसेट कर दिया गया है।",
    "Failed to reset counter.": "काउंटर रीसेट करने में विफल।",
    "Offline: Data saved locally. Auto-sync will start when online.": "ऑफ़लाइन: डेटा स्थानीय रूप से सहेजा गया। ऑनलाइन होने पर ऑटो-सिंक शुरू हो जाएगा।",
    "Groq AI Core Offline: Ensure your Uvicorn server is running on port 8000!": "Groq AI कोर ऑफ़लाइन: सुनिश्चित करें कि आपका Uvicorn सर्वर पोर्ट 8000 पर चल रहा है!",
    "Could not connect to Krater YOLO Backend": "Krater YOLO बैकएंड से कनेक्ट नहीं हो सका",
    "Vision Core Offline: Check your Python YOLO server!": "विज़न कोर ऑफ़लाइन: अपने Python YOLO सर्वर की जाँच करें!",
    "Analysis complete! I found ": "विश्लेषण पूरा हुआ! मुझे ",
    " pothole(s) with ": " गड्ढे मिले हैं जिनकी गंभीरता ",
    " severity. Ticket ": " है। टिकट ",
    " created.": " बनाया गया है।",
    "Analysis complete! I didn't find any potholes in this image. No ticket was created, as the road looks clear.": "विश्लेषण पूरा हुआ! मुझे इस छवि में कोई गड्ढा नहीं मिला। कोई टिकट नहीं बनाया गया है, क्योंकि सड़क साफ दिख रही है।",
    "Select a report from the log to view details & allocate resources.": "विवरण देखने और संसाधनों को आवंटित करने के लिए लॉग से एक रिपोर्ट चुनें।",
    "Sign-In": "साइन-इन",
    "Register": "रजिस्टर",
    "Username": "उपयोगकर्ता नाम",
    "Password": "पासवर्ड",
    "Confirm Password": "पासवर्ड पुष्टि",
    "New User?": "नए उपयोगकर्ता?",
    "Already a User?": "पहले से उपयोगकर्ता?",
    "Location:": "स्थान:",
    "Report": "रिपोर्ट करें",
    "Decline": "अस्वीकार करें",
    "Road Inspector": "रोड इंस्पेक्टर",
    "EST. MATERIAL": "अनुमानित सामग्री",
    "Est. Material": "अनुमानित सामग्री",
    "EST. COST": "अनुमानित लागत",
    "Est. Cost": "अनुमानित लागत",
    "ALLOCATED BUDGET": "आवंटित बजट",
    "Allocated Budget": "आवंटित बजट",
    "sq meters": "वर्ग मीटर",
    "Pending": "लंबित",
    "Pending Admin": "व्यवस्थापक लंबित",
    "AI Estimated Budget (INR)": "AI अनुमानित बजट (INR)",
    "Material Required (Asphalt)": "आवश्यक सामग्री (डामर)",


  },
  Bengali_India: {
    "NEW CHAT": "নতুন চ্যাট",
    "OFFLINE MODE": "অফলাইন মোড",
    "RESET COUNTER": "কাউন্টার রিসেট করুন",
    "DARK MODE?": "ডার্ক মোড?",
    "LIGHT MODE?": "লাইট মোড?",
    "CHAT HISTORY": "চ্যাট ইতিহাস",
    "Language": "ভাষা",
    "Welcome,": "স্বাগতম,",
    "Add another account": "অন্য অ্যাকাউন্ট যোগ করুন",
    "Switch Accounts": "অ্যাকাউন্ট পরিবর্তন করুন",
    "Sign-Out": "সাইন-আউট",
    "Recent Chats": "সাম্প্রতিক চ্যাট",
    "No saved chats yet.": "এখনও কোনো চ্যাট সেভ করা হয়নি।",
    "Are you sure you want to clear this history?": "আপনি কি নিশ্চিত যে আপনি এই ইতিহাস মুছতে চান?",
    "This chat will be removed from Chat History.": "এই চ্যাটটি চ্যাট ইতিহাস থেকে মুছে ফেলা হবে।",
    "No": "না",
    "Yes": "হ্যাঁ",
    "Hello": "নমস্কার",
    "How can I help you with road safety today?": "আজ আমি আপনাকে সড়ক নিরাপত্তা নিয়ে কীভাবে সাহায্য করতে পারি?",
    "Upload a Photo...": "একটি ছবি আপলোড করুন...",
    "Upload a Photo and Describe the Issue...": "একটি ছবি আপলোড করুন এবং সমস্যাটির বর্ণনা দিন...",
    "Type a message...": "একটি বার্তা টাইপ করুন...",
    "Drop image to attach to chat": "চ্যাটে সংযুক্ত করতে ছবি এখানে ফেলুন",
    "Analyzing Road Data... ": "সড়কের ডেটা বিশ্লেষণ করা হচ্ছে... ",
    "TICKET:": "টিকিট:",
    "Potholes": "গর্ত",
    "Severity": "তীব্রতা",
    "Road:": "সড়ক:",
    "Target Completion:": "লক্ষ্য সমাপ্তি:",
    "CONTRACTOR": "ঠিকাদার",
    "PROJECT ENGINEER": "প্রজেক্ট ইঞ্জিনিয়ার",
    "Click here to view the location on Google Maps": "গুগল ম্যাপে অবস্থান দেখতে এখানে ক্লিক করুন",
    "REPORTS LOG": "রিপোর্ট লগ",
    "TICKETS": "টিকিট",
    "No reports generated yet.": "এখনও কোনো রিপোর্ট তৈরি হয়নি।",
    "Reported:": "রিপোর্ট করা হয়েছে:",
    "Just now": "এইমাত্র",
    "Allocated": "বরাদ্দকৃত",
    "OPEN": "উন্মুক্ত",
    "Location": "অবস্থান",
    "Potholes Detected": "গর্ত শনাক্ত হয়েছে",
    "Confirmed by Road Inspector": "সড়ক পরিদর্শক দ্বারা নিশ্চিতকৃত",
    "Status": "অবস্থা",
    "Change?": "পরিবর্তন?",
    "Operations & Resource Allocation": "অপারেশনস এবং সম্পদ বরাদ্দ",
    "Budget Allocation (INR)": "বাজেট বরাদ্দ (BDT)",
    "Repair Deadline": "মেরামতের সময়সীমা",
    "Select a date...": "একটি তারিখ নির্বাচন করুন...",
    "Save Allocations & Deadline": "বরাদ্দ এবং সময়সীমা সেভ করুন",
    "Confirm Status": "অবস্থা নিশ্চিত করুন",
    "Are you sure you want to change the status to ": "আপনি কি নিশ্চিত যে আপনি অবস্থা পরিবর্তন করে এটি করতে চান: ",
    "Cancel": "বাতিল করুন",
    "Confirm": "নিশ্চিত করুন",
    "Chat View": "চ্যাট ভিউ",
    "Admin View": "অ্যাডমিন ভিউ",
    "CHAT VIEW": "চ্যাট ভিউ",
    "ADMIN VIEW": "অ্যাডমিন ভিউ",
    "Offline Mode: Site functionality is currently limited.": "অফলাইন মোড: সাইটের কার্যকারিতা বর্তমানে সীমিত।",
    "Localization is unavailable while offline.": "অফলাইন থাকাকালীন স্থানীয়করণ অনুপলব্ধ।",
    "History is unavailable while offline.": "অফলাইন থাকাকালীন ইতিহাস অনুপলব্ধ।",
    "User profile is unavailable while offline.": "অফলাইন থাকাকালীন ব্যবহারকারী প্রোফাইল অনুপলব্ধ।",
    "BUDGET ALLOCATED": "বাজেট বরাদ্দকৃত",
    "IN PROGRESS": "চলমান",
    "RESOLVED": "সমাধান করা হয়েছে",
    "DECLINED": "প্রত্যাখ্যাত",
    "Only PNG and JPEG files are allowed.": "শুধুমাত্র PNG এবং JPEG ফাইল অনুমোদিত।",
    "Only 1 image can be attached at a time.": "একবারে শুধুমাত্র ১টি ছবি সংযুক্ত করা যেতে পারে।",
    "Report updated successfully!": "রিপোর্ট সফলভাবে আপডেট করা হয়েছে!",
    "Failed to update report.": "রিপোর্ট আপডেট করতে ব্যর্থ।",
    "Status update timed out. Please check your connection.": "স্ট্যাটাস আপডেটের সময় শেষ হয়েছে। আপনার সংযোগ পরীক্ষা করুন।",
    "Failed to update status.": "স্ট্যাটাস আপডেট করতে ব্যর্থ।",
    "Status updated to ": "স্ট্যাটাস আপডেট করে করা হয়েছে: ",
    "Failed to load chat history.": "চ্যাট ইতিহাস লোড করতে ব্যর্থ।",
    "Connection restored! Syncing your data...": "সংযোগ পুনরুদ্ধার করা হয়েছে! আপনার ডেটা সিঙ্ক করা হচ্ছে...",
    "Ticket counter has been reset to 0.": "টিকিট কাউন্টার 0 এ রিসেট করা হয়েছে।",
    "Failed to reset counter.": "কাউন্টার রিসেট করতে ব্যর্থ।",
    "Offline: Data saved locally. Auto-sync will start when online.": "অফলাইন: ডেটা স্থানীয়ভাবে সেভ করা হয়েছে। অনলাইনে আসলে অটো-সিঙ্ক শুরু হবে।",
    "Groq AI Core Offline: Ensure your Uvicorn server is running on port 8000!": "Groq AI কোর অফলাইন: নিশ্চিত করুন যে আপনার Uvicorn সার্ভার পোর্ট 8000 এ চলছে!",
    "Could not connect to Krater YOLO Backend": "Krater YOLO ব্যাকএন্ডের সাথে সংযোগ করা যায়নি",
    "Vision Core Offline: Check your Python YOLO server!": "ভিশন কোর অফলাইন: আপনার Python YOLO সার্ভার চেক করুন!",
    "Analysis complete! I found ": "বিশ্লেষণ সম্পূর্ণ! আমি পেয়েছি ",
    " pothole(s) with ": " টি গর্ত যার তীব্রতা ",
    " severity. Ticket ": "। টিকিট ",
    " created.": " তৈরি করা হয়েছে।",
    "Analysis complete! I didn't find any potholes in this image. No ticket was created, as the road looks clear.": "বিশ্লেষণ সম্পূর্ণ! আমি এই ছবিতে কোনো গর্ত পাইনি। কোনো টিকিট তৈরি করা হয়নি, কারণ রাস্তা পরিষ্কার দেখাচ্ছে।",
    "Select a report from the log to view details & allocate resources.": "বিস্তারিত দেখতে এবং সম্পদ বরাদ্দ করতে লগ থেকে একটি রিপোর্ট নির্বাচন করুন।",
    "Sign-In": "সাইন-ইন",
    "Register": "রেজিস্টার",
    "Username": "ব্যবহারকারীর নাম",
    "Password": "পাসওয়ার্ড",
    "Confirm Password": "পাসওয়ার্ড নিশ্চিত করুন",
    "New User?": "নতুন ব্যবহারকারী?",
    "Already a User?": "ইতিমধ্যে ব্যবহারকারী?",
    "Location:": "অবস্থান:",
    "Report": "রিপোর্ট করুন",
    "Decline": "অস্বীকার করুন",
    "Road Inspector": "রোড ইন্সপেক্টর", "EST. MATERIAL": "আনুমানিক উপাদান",
    "Est. Material": "আনুমানিক উপাদান",
    "EST. COST": "আনুমানিক খরচ",
    "Est. Cost": "আনুমানিক খরচ",
    "ALLOCATED BUDGET": "বরাদ্দকৃত বাজেট",
    "Allocated Budget": "বরাদ্দকৃত বাজেট",
    "sq meters": "বর্গ মিটার",
    "Pending": "পেন্ডিং",
    "Pending Admin": "অ্যাডমিন পেন্ডিং",
    "AI Estimated Budget (INR)": "AI আনুমানিক বাজেট (INR)",
    "Material Required (Asphalt)": "প্রয়োজনীয় উপাদান (অ্যাসফল্ট)",

  },
  Bengali_Bangladesh: {
    "NEW CHAT": "নতুন চ্যাট",
    "OFFLINE MODE": "অফলাইন মোড",
    "RESET COUNTER": "কাউন্টার রিসেট করুন",
    "DARK MODE?": "ডার্ক মোড?",
    "LIGHT MODE?": "লাইট মোড?",
    "CHAT HISTORY": "চ্যাট ইতিহাস",
    "Language": "ভাষা",
    "Welcome,": "স্বাগতম,",
    "Add another account": "অন্য অ্যাকাউন্ট যোগ করুন",
    "Switch Accounts": "অ্যাকাউন্ট পরিবর্তন করুন",
    "Sign-Out": "সাইন-আউট",
    "Recent Chats": "সাম্প্রতিক চ্যাট",
    "No saved chats yet.": "এখনও কোনো চ্যাট সেভ করা হয়নি।",
    "Are you sure you want to clear this history?": "আপনি কি নিশ্চিত যে আপনি এই ইতিহাস মুছতে চান?",
    "This chat will be removed from Chat History.": "এই চ্যাটটি চ্যাট ইতিহাস থেকে মুছে ফেলা হবে।",
    "No": "না",
    "Yes": "হ্যাঁ",
    "Hello": "নমস্কার",
    "How can I help you with road safety today?": "আজ আমি আপনাকে সড়ক নিরাপত্তা নিয়ে কীভাবে সাহায্য করতে পারি?",
    "Upload a Photo...": "একটি ছবি আপলোড করুন...",
    "Upload a Photo and Describe the Issue...": "একটি ছবি আপলোড করুন এবং সমস্যাটির বর্ণনা দিন...",
    "Type a message...": "একটি বার্তা টাইপ করুন...",
    "Drop image to attach to chat": "চ্যাটে সংযুক্ত করতে ছবি এখানে ফেলুন",
    "Analyzing Road Data... ": "সড়কের ডেটা বিশ্লেষণ করা হচ্ছে... ",
    "TICKET:": "টিকিট:",
    "Potholes": "গর্ত",
    "Severity": "তীব্রতা",
    "Road:": "সড়ক:",
    "Target Completion:": "লক্ষ্য সমাপ্তি:",
    "CONTRACTOR": "ঠিকাদার",
    "PROJECT ENGINEER": "প্রজেক্ট ইঞ্জিনিয়ার",
    "Click here to view the location on Google Maps": "গুগল ম্যাপে অবস্থান দেখতে এখানে ক্লিক করুন",
    "REPORTS LOG": "রিপোর্ট লগ",
    "TICKETS": "টিকিট",
    "No reports generated yet.": "এখনও কোনো রিপোর্ট তৈরি হয়নি।",
    "Reported:": "রিপোর্ট করা হয়েছে:",
    "Just now": "এইমাত্র",
    "Allocated": "বরাদ্দকৃত",
    "OPEN": "উন্মুক্ত",
    "Location": "অবস্থান",
    "Potholes Detected": "গর্ত শনাক্ত হয়েছে",
    "Confirmed by Road Inspector": "সড়ক পরিদর্শক দ্বারা নিশ্চিতকৃত",
    "Status": "অবস্থা",
    "Change?": "পরিবর্তন?",
    "Operations & Resource Allocation": "অপারেশনস এবং সম্পদ বরাদ্দ",
    "Budget Allocation (INR)": "বাজেট বরাদ্দ (BDT)",
    "Repair Deadline": "মেরামতের সময়সীমা",
    "Select a date...": "একটি তারিখ নির্বাচন করুন...",
    "Save Allocations & Deadline": "বরাদ্দ এবং সময়সীমা সেভ করুন",
    "Confirm Status": "অবস্থা নিশ্চিত করুন",
    "Are you sure you want to change the status to ": "আপনি কি নিশ্চিত যে আপনি অবস্থা পরিবর্তন করে এটি করতে চান: ",
    "Cancel": "বাতিল করুন",
    "Confirm": "নিশ্চিত করুন",
    "Chat View": "চ্যাট ভিউ",
    "Admin View": "অ্যাডমিন ভিউ",
    "CHAT VIEW": "চ্যাট ভিউ",
    "ADMIN VIEW": "অ্যাডমিন ভিউ",
    "Offline Mode: Site functionality is currently limited.": "অফলাইন মোড: সাইটের কার্যকারিতা বর্তমানে সীমিত।",
    "Localization is unavailable while offline.": "অফলাইন থাকাকালীন স্থানীয়করণ অনুপলব্ধ।",
    "History is unavailable while offline.": "অফলাইন থাকাকালীন ইতিহাস অনুপলব্ধ।",
    "User profile is unavailable while offline.": "অফলাইন থাকাকালীন ব্যবহারকারী প্রোফাইল অনুপলব্ধ।",
    "BUDGET ALLOCATED": "বাজেট বরাদ্দকৃত",
    "IN PROGRESS": "চলমান",
    "RESOLVED": "সমাধান করা হয়েছে",
    "DECLINED": "প্রত্যাখ্যাত",
    "Only PNG and JPEG files are allowed.": "শুধুমাত্র PNG এবং JPEG ফাইল অনুমোদিত।",
    "Only 1 image can be attached at a time.": "একবারে শুধুমাত্র ১টি ছবি সংযুক্ত করা যেতে পারে।",
    "Report updated successfully!": "রিপোর্ট সফলভাবে আপডেট করা হয়েছে!",
    "Failed to update report.": "রিপোর্ট আপডেট করতে ব্যর্থ।",
    "Status update timed out. Please check your connection.": "স্ট্যাটাস আপডেটের সময় শেষ হয়েছে। আপনার সংযোগ পরীক্ষা করুন।",
    "Failed to update status.": "স্ট্যাটাস আপডেট করতে ব্যর্থ।",
    "Status updated to ": "স্ট্যাটাস আপডেট করে করা হয়েছে: ",
    "Failed to load chat history.": "চ্যাট ইতিহাস লোড করতে ব্যর্থ।",
    "Connection restored! Syncing your data...": "সংযোগ পুনরুদ্ধার করা হয়েছে! আপনার ডেটা সিঙ্ক করা হচ্ছে...",
    "Ticket counter has been reset to 0.": "টিকিট কাউন্টার 0 এ রিসেট করা হয়েছে।",
    "Failed to reset counter.": "কাউন্টার রিসেট করতে ব্যর্থ।",
    "Offline: Data saved locally. Auto-sync will start when online.": "অফলাইন: ডেটা স্থানীয়ভাবে সেভ করা হয়েছে। অনলাইনে আসলে অটো-সিঙ্ক শুরু হবে।",
    "Groq AI Core Offline: Ensure your Uvicorn server is running on port 8000!": "Groq AI কোর অফলাইন: নিশ্চিত করুন যে আপনার Uvicorn সার্ভার পোর্ট 8000 এ চলছে!",
    "Could not connect to Krater YOLO Backend": "Krater YOLO ব্যাকএন্ডের সাথে সংযোগ করা যায়নি",
    "Vision Core Offline: Check your Python YOLO server!": "ভিশন কোর অফলাইন: আপনার Python YOLO সার্ভার চেক করুন!",
    "Analysis complete! I found ": "বিশ্লেষণ সম্পূর্ণ! আমি পেয়েছি ",
    " pothole(s) with ": " টি গর্ত যার তীব্রতা ",
    " severity. Ticket ": "। টিকিট ",
    " created.": " তৈরি করা হয়েছে।",
    "Analysis complete! I didn't find any potholes in this image. No ticket was created, as the road looks clear.": "বিশ্লেষণ সম্পূর্ণ! আমি এই ছবিতে কোনো গর্ত পাইনি। কোনো টিকিট তৈরি করা হয়নি, কারণ রাস্তা পরিষ্কার দেখাচ্ছে।",
    "Select a report from the log to view details & allocate resources.": "বিস্তারিত দেখতে এবং সম্পদ বরাদ্দ করতে লগ থেকে একটি রিপোর্ট নির্বাচন করুন।",
    "Sign-In": "সাইন-ইন",
    "Register": "রেজিস্টার",
    "Username": "ব্যবহারকারীর নাম",
    "Password": "পাসওয়ার্ড",
    "Confirm Password": "পাসওয়ার্ড নিশ্চিত করুন",
    "New User?": "নতুন ব্যবহারকারী?",
    "Already a User?": "ইতিমধ্যে ব্যবহারকারী?",
    "Location:": "অবস্থান:",
    "Report": "রিপোর্ট করুন",
    "Decline": "অস্বীকার করুন",
    "Road Inspector": "রোড ইন্সপেক্টর", "EST. MATERIAL": "আনুমানিক উপাদান",
    "Est. Material": "আনুমানিক উপাদান",
    "EST. COST": "আনুমানিক খরচ",
    "Est. Cost": "আনুমানিক খরচ",
    "ALLOCATED BUDGET": "বরাদ্দকৃত বাজেট",
    "Allocated Budget": "বরাদ্দকৃত বাজেট",
    "sq meters": "বর্গ মিটার",
    "Pending": "পেন্ডিং",
    "Pending Admin": "অ্যাডমিন পেন্ডিং",
    "AI Estimated Budget (INR)": "AI আনুমানিক বাজেট (BDT)",
    "Material Required (Asphalt)": "প্রয়োজনীয় উপাদান (অ্যাসফল্ট)",
  },
  Nepali: {
    "NEW CHAT": "नयाँ कुराकानी",
    "OFFLINE MODE": "अफलाइन मोड",
    "RESET COUNTER": "काउन्टर रिसेट गर्नुहोस्",
    "DARK MODE?": "डार्क मोड?",
    "LIGHT MODE?": "लाइट मोड?",
    "CHAT HISTORY": "कुराकानी इतिहास",
    "Language": "भाषा",
    "Welcome,": "स्वागत छ,",
    "Add another account": "अर्को खाता थप्नुहोस्",
    "Switch Accounts": "खाता बदल्नुहोस्",
    "Sign-Out": "साइन-आउट",
    "Recent Chats": "भर्खरका कुराकानीहरू",
    "No saved chats yet.": "अहिलेसम्म कुनै कुराकानी सुरक्षित गरिएको छैन।",
    "Are you sure you want to clear this history?": "के तपाईं निश्चित रूपमा यो इतिहास मेटाउन चाहनुहुन्छ?",
    "This chat will be removed from Chat History.": "यो कुराकानी इतिहासबाट हटाइनेछ।",
    "No": "होइन",
    "Yes": "हो",
    "Hello": "नमस्ते",
    "How can I help you with road safety today?": "आज म तपाईंलाई सडक सुरक्षामा कसरी मद्दत गर्न सक्छु?",
    "Upload a Photo...": "फोटो अपलोड गर्नुहोस्...",
    "Upload a Photo and Describe the Issue...": "फोटो अपलोड गर्नुहोस् र समस्या वर्णन गर्नुहोस्...",
    "Type a message...": "सन्देश टाइप गर्नुहोस्...",
    "Drop image to attach to chat": "कुराकानीमा संलग्न गर्न छवि यहाँ छोड्नुहोस्",
    "Analyzing Road Data... ": "सडक डेटा विश्लेषण गर्दै... ",
    "TICKET:": "टिकट:",
    "Potholes": "खाडलहरू",
    "Severity": "गम्भीरता",
    "Road:": "सडक:",
    "Target Completion:": "लक्ष्य पूरा हुने मिति:",
    "CONTRACTOR": "ठेकेदार",
    "PROJECT ENGINEER": "प्रोजेक्ट इन्जिनियर",
    "Click here to view the location on Google Maps": "गुगल म्यापमा स्थान हेर्न यहाँ क्लिक गर्नुहोस्",
    "REPORTS LOG": "रिपोर्ट लग",
    "TICKETS": "टिकटहरू",
    "No reports generated yet.": "अहिलेसम्म कुनै रिपोर्ट तयार भएको छैन।",
    "Reported:": "रिपोर्ट गरिएको:",
    "Just now": "भर्खरै",
    "Allocated": "अलोकेट गरिएको",
    "OPEN": "खुला",
    "Location": "स्थान",
    "Potholes Detected": "खाडलहरू फेला पर्यो",
    "Confirmed by Road Inspector": "सडक निरीक्षकद्वारा पुष्टि गरिएको",
    "Status": "अवस्था",
    "Change?": "बदल्ने?",
    "Operations & Resource Allocation": "अपरेशन र स्रोत आवंटन",
    "Budget Allocation (INR)": "बजेट आवंटन (NPR)",
    "Repair Deadline": "मर्मत समयसीमा",
    "Select a date...": "मिति चयन गर्नुहोस्...",
    "Save Allocations & Deadline": "आवंटन र समयसीमा सुरक्षित गर्नुहोस्",
    "Confirm Status": "अवस्था पुष्टि गर्नुहोस्",
    "Are you sure you want to change the status to ": "के तपाईं निश्चित रूपमा अवस्था बदल्न चाहनुहुन्छ: ",
    "Cancel": "रद्द गर्नुहोस्",
    "Confirm": "पुष्टि गर्नुहोस्",
    "Chat View": "च्याट भ्यू",
    "Admin View": "एडमिन भ्यू",
    "CHAT VIEW": "च्याट भ्यू",
    "ADMIN VIEW": "एडमिन भ्यू",
    "Offline Mode: Site functionality is currently limited.": "अफलाइन मोड: साइटको कार्यक्षमता हाल सीमित छ।",
    "Localization is unavailable while offline.": "अफलाइन हुँदा स्थानीयकरण उपलब्ध छैन।",
    "History is unavailable while offline.": "अफलाइन हुँदा इतिहास उपलब्ध छैन।",
    "User profile is unavailable while offline.": "अफलाइन हुँदा प्रयोगकर्ता प्रोफाइल उपलब्ध छैन।",
    "BUDGET ALLOCATED": "बजेट आवंटित",
    "IN PROGRESS": "कार्य प्रगतिमा",
    "RESOLVED": "समाधान गरिएको",
    "DECLINED": "अस्वीकार गरिएको",
    "Only PNG and JPEG files are allowed.": "केवल PNG र JPEG फाइलहरूलाई अनुमति छ।",
    "Only 1 image can be attached at a time.": "एक पटकमा केवल १ छवि संलग्न गर्न सकिन्छ।",
    "Report updated successfully!": "रिपोर्ट सफलतापूर्वक अद्यावधिक गरियो!",
    "Failed to update report.": "रिपोर्ट अद्यावधिक गर्न असफल भयो।",
    "Status update timed out. Please check your connection.": "अवस्था अद्यावधिक समय समाप्त भयो। कृपया आफ्नो जडान जाँच गर्नुहोस्।",
    "Failed to update status.": "अवस्था अद्यावधिक गर्न असफल भयो।",
    "Status updated to ": "अवस्था अद्यावधिक गरियो: ",
    "Failed to load chat history.": "च्याट इतिहास लोड गर्न असफल भयो।",
    "Connection restored! Syncing your data...": "जडान पुनर्स्थापित भयो! तपाईंको डेटा सिङ्क गर्दै...",
    "Ticket counter has been reset to 0.": "टिकट काउन्टर ० मा रिसेट गरिएको छ।",
    "Failed to reset counter.": "काउन्टर रिसेट गर्न असफल भयो।",
    "Offline: Data saved locally. Auto-sync will start when online.": "अफलाइन: डेटा स्थानीय रूपमा सुरक्षित गरियो। अनलाइन भएपछि स्वतः सिङ्क सुरु हुनेछ।",
    "Groq AI Core Offline: Ensure your Uvicorn server is running on port 8000!": "Groq AI कोर अफलाइन: सुनिश्चित गर्नुहोस् कि तपाईंको Uvicorn सर्भर पोर्ट ८००० मा चलिरहेको छ!",
    "Could not connect to Krater YOLO Backend": "Krater YOLO ब्याकइन्डमा जडान हुन सकेन",
    "Vision Core Offline: Check your Python YOLO server!": "भिजन कोर अफलाइन: आफ्नो Python YOLO सर्भर जाँच गर्नुहोस्!",
    "Analysis complete! I found ": "विश्लेषण पूरा भयो! मैले फेला पारे ",
    " pothole(s) with ": " खाडल(हरू) जसको गम्भीरता ",
    " severity. Ticket ": " छ। टिकट ",
    " created.": " सिर्जना गरियो।",
    "Analysis complete! I didn't find any potholes in this image. No ticket was created, as the road looks clear.": "विश्लेषण पूरा भयो! मैले यो छविमा कुनै खाडल फेला पारिन। कुनै टिकट सिर्जना गरिएको छैन, किनकि सडक सफा देखिन्छ।",
    "Select a report from the log to view details & allocate resources.": "विवरण हेर्न र स्रोतहरू आवंटित गर्न लगबाट एउटा रिपोर्ट चयन गर्नुहोस्।",
    "Sign-In": "साइन-इन",
    "Register": "दर्ता",
    "Username": "प्रयोगकर्ता नाम",
    "Password": "पासवर्ड",
    "Confirm Password": "पासवर्ड पुष्टि",
    "New User?": "नयाँ प्रयोगकर्ता?",
    "Already a User?": "पहिले नै प्रयोगकर्ता?",
    "Location:": "स्थान:",
    "Report": "रिपोर्ट गर्नुहोस्",
    "Decline": "अस्वीकार गर्नुहोस्",
    "Road Inspector": "रोड इन्स्पेक्टर",
    "EST. MATERIAL": "अनुमानित सामग्री",
    "Est. Material": "अनुमानित सामग्री",
    "EST. COST": "अनुमानित लागत",
    "Est. Cost": "अनुमानित लागत",
    "ALLOCATED BUDGET": "छुट्टाइएको बजेट",
    "Allocated Budget": "छुट्टाइएको बजेट",
    "sq meters": "वर्ग मिटर",
    "Pending": "बाँकी",
    "Pending Admin": "प्रशासक अनुमति बाँकी",
    "AI Estimated Budget (INR)": "AI अनुमानित बजेट (INR)",
    "Material Required (Asphalt)": "आवश्यक सामग्री (अलकत्रा)",

  },
  Sinhala: {
    "NEW CHAT": "නව සංවාදය",
    "OFFLINE MODE": "නොබැඳි ප්රකාරය",
    "RESET COUNTER": "කවුන්ටරය නැවත සකසන්න",
    "DARK MODE?": "අඳුරු ප්‍රකාරය?",
    "LIGHT MODE?": "ආලෝක ප්‍රකාරය?",
    "CHAT HISTORY": "සංවාද ඉතිහාසය",
    "Language": "භාෂාව",
    "Welcome,": "සාදරයෙන් පිළිගනිමු,",
    "Add another account": "තවත් ගිණුමක් එකතු කරන්න",
    "Switch Accounts": "ගිණුම් මාරු කරන්න",
    "Sign-Out": "පිටවීම",
    "Recent Chats": "මෑත සංවාද",
    "No saved chats yet.": "තවම සුරකින ලද සංවාද නැත.",
    "Are you sure you want to clear this history?": "ඔබට මෙම ඉතිහාසය මකා දැමීමට අවශ්‍ය බව විශ්වාසද?",
    "This chat will be removed from Chat History.": "මෙම සංවාදය සංවාද ඉතිහාසයෙන් ඉවත් කෙරේ.",
    "No": "නැත",
    "Yes": "ඔව්",
    "Hello": "ආයුබෝවන්",
    "How can I help you with road safety today?": "අද මාර්ග ආරක්ෂාව සම්බන්ධයෙන් මට ඔබට කෙසේ උදව් කළ හැකිද?",
    "Upload a Photo...": "ඡායාරූපයක් උඩුගත කරන්න...",
    "Upload a Photo and Describe the Issue...": "ඡායාරූපයක් උඩුගත කර ගැටලුව විස්තර කරන්න...",
    "Type a message...": "පණිවිඩයක් ටයිප් කරන්න...",
    "Drop image to attach to chat": "සංවාදයට ඇමිණීමට රූපය මෙහි හෙළන්න",
    "Analyzing Road Data... ": "මාර්ග දත්ත විශ්ලේෂණය කරමින්... ",
    "TICKET:": "ටිකට්පත:",
    "Potholes": "වලවල්",
    "Severity": "බරපතලකම",
    "Road:": "මාර්ගය:",
    "Target Completion:": "ඉලක්ක සම්පූර්ණ කිරීම:",
    "CONTRACTOR": "කොන්ත්‍රාත්කරු",
    "PROJECT ENGINEER": "ව්‍යාපෘති ඉංජිනේරු",
    "Click here to view the location on Google Maps": "ස්ථානය Google Maps මත බැලීමට මෙහි ක්ලික් කරන්න",
    "REPORTS LOG": "වාර්තා ලොගය",
    "TICKETS": "ටිකට්පත්",
    "No reports generated yet.": "තවම කිසිදු වාර්තාවක් ජනනය කර නැත.",
    "Reported:": "වාර්තා කරන ලදී:",
    "Just now": "දැන්ම",
    "Allocated": "වෙන් කර ඇත",
    "OPEN": "විවෘත",
    "Location": "ස්ථානය",
    "Potholes Detected": "වලවල් හඳුනාගෙන ඇත",
    "Confirmed by Road Inspector": "මාර්ග පරීක්ෂකවරයා විසින් තහවුරු කර ඇත",
    "Status": "තත්ත්වය",
    "Change?": "වෙනස් කරන්නද?",
    "Operations & Resource Allocation": "මෙහෙයුම් සහ සම්පත් වෙන්කිරීම",
    "Budget Allocation (INR)": "අයවැය වෙන්කිරීම (LKR)",
    "Repair Deadline": "අලුත්වැඩියා කාල සීමාව",
    "Select a date...": "දිනයක් තෝරන්න...",
    "Save Allocations & Deadline": "වෙන්කිරීම් සහ කාල සීමාව සුරකින්න",
    "Confirm Status": "තත්ත්වය තහවුරු කරන්න",
    "Are you sure you want to change the status to ": "ඔබට තත්ත්වය වෙනස් කිරීමට අවශ්‍ය බව විශ්වාසද: ",
    "Cancel": "අවලංගු කරන්න",
    "Confirm": "තහවුරු කරන්න",
    "Chat View": "සංවාද දසුන",
    "Admin View": "පරිපාලක දසුන",
    "CHAT VIEW": "සංවාද දසුන",
    "ADMIN VIEW": "පරිපාලක දසුන",
    "Offline Mode: Site functionality is currently limited.": "නොබැඳි ප්‍රකාරය: වෙබ් අඩවියේ ක්‍රියාකාරීත්වය දැනට සීමිතයි.",
    "Localization is unavailable while offline.": "නොබැඳි අවස්ථාවේදී දේශීයකරණය නොලැබේ.",
    "History is unavailable while offline.": "නොබැඳි අවස්ථාවේදී ඉතිහාසය නොලැබේ.",
    "User profile is unavailable while offline.": "නොබැඳි අවස්ථාවේදී පරිශීලක පැතිකඩ නොලැබේ.",
    "BUDGET ALLOCATED": "අයවැය වෙන් කර ඇත",
    "IN PROGRESS": "ප්‍රගතියේ පවතී",
    "RESOLVED": "විසඳා ඇත",
    "DECLINED": "ප්‍රතික්ෂේප කර ඇත",
    "Only PNG and JPEG files are allowed.": "PNG සහ JPEG ගොනු පමණක් අනුමත වේ.",
    "Only 1 image can be attached at a time.": "වරකට රූපයක් 1ක් පමණක් ඇමිණිය හැකිය.",
    "Report updated successfully!": "වාර්තාව සාර්ථකව යාවත්කාලීන කරන ලදී!",
    "Failed to update report.": "වාර්තාව යාවත්කාලීන කිරීමට අසමත් විය.",
    "Status update timed out. Please check your connection.": "තත්ත්ව යාවත්කාලීනය කල් ඉකුත් විය. කරුණාකර ඔබේ සම්බන්ධතාවය පරීක්ෂා කරන්න.",
    "Failed to update status.": "තත්ත්වය යාවත්කාලීන කිරීමට අසමත් විය.",
    "Status updated to ": "තත්ත්වය යාවත්කාලීන කරන ලදී: ",
    "Failed to load chat history.": "සංවාද ඉතිහාසය පූරණය කිරීමට අසමත් විය.",
    "Connection restored! Syncing your data...": "සම්බන්ධතාවය ප්‍රතිස්ථාපනය විය! ඔබේ දත්ත සමමුහුර්ත කරමින්...",
    "Ticket counter has been reset to 0.": "ටිකට් කවුන්ටරය 0 ට නැවත සකසා ඇත.",
    "Failed to reset counter.": "කවුන්ටරය නැවත සැකසීමට අසමත් විය.",
    "Offline: Data saved locally. Auto-sync will start when online.": "නොබැඳි: දත්ත ස්ථානීයව සුරකින ලදී. බැඳි වූ විට ස්වයංක්‍රීය සමමුහුර්තකරණය ආරම්භ වේ.",
    "Groq AI Core Offline: Ensure your Uvicorn server is running on port 8000!": "Groq AI Core නොබැඳි: ඔබේ Uvicorn සේවාදායකය Port 8000 මත ක්‍රියාත්මක වන බව සහතික කරන්න!",
    "Could not connect to Krater YOLO Backend": "Krater YOLO Backend වෙත සම්බන්ධ විය නොහැකි විය",
    "Vision Core Offline: Check your Python YOLO server!": "Vision Core නොබැඳි: ඔබේ Python YOLO සේවාදායකය පරීක්ෂා කරන්න!",
    "Analysis complete! I found ": "විශ්ලේෂණය සම්පූර්ණයි! මට හමු වූයේ ",
    " pothole(s) with ": " වලවල් සහිතව ",
    " severity. Ticket ": " බරපතලකම. ටිකට්පත ",
    " created.": " සාදන ලදී.",
    "Analysis complete! I didn't find any potholes in this image. No ticket was created, as the road looks clear.": "විශ්ලේෂණය සම්පූර්ණයි! මෙම රූපයේ කිසිදු වලවලක් මට හමු නොවීය. මාර්ගය පිරිසිදු බැවින් ටිකට්පතක් සාදන ලද්දේ නැත.",
    "Select a report from the log to view details & allocate resources.": "විස්තර බැලීමට සහ සම්පත් වෙන්කිරීමට ලොගයෙන් වාර්තාවක් තෝරන්න.",
    "Sign-In": "පිවිසෙන්න",
    "Register": "ලියාපදිංචිය",
    "Username": "පරිශීලක නාමය",
    "Password": "මුරපදය",
    "Confirm Password": "මුරපදය තහවුරු කරන්න",
    "New User?": "නව පරිශීලකයෙක්?",
    "Already a User?": "දැනටමත් පරිශීලකයෙක්?",
    "Location:": "ස්ථානය:",
    "Report": "වාර්තා කරන්න",
    "Decline": "අවලංගු කරන්න",
    "Road Inspector": "පාර පරීක්ෂක",
    "EST. MATERIAL": "ඇස්තමේන්තුගත ද්‍රව්‍ය",
    "Est. Material": "ඇස්තමේන්තුගත ද්‍රව්‍ය",
    "EST. COST": "ඇස්තමේන්තුගත පිරිවැය",
    "Est. Cost": "ඇස්තමේන්තුගත පිරිවැය",
    "ALLOCATED BUDGET": "වෙන්කළ අයවැය",
    "Allocated Budget": "වෙන්කළ අයවැය",
    "sq meters": "වර්ග මීටර",
    "Pending": "නොවිසඳී පවතින",
    "Pending Admin": "පරිපාලක අනුමැතිය ලැබෙන තෙක්",
    "AI Estimated Budget (INR)": "AI ඇස්තමේන්තුගත අයවැය (INR)",
    "Material Required (Asphalt)": "අවශ්‍ය ද්‍රව්‍ය (ඇස්ෆල්ට්)",

  },
  Dzongkha: {
    "NEW CHAT": "གསར་པའི་གླེང་མོལ།",
    "OFFLINE MODE": "དྲ་རྒྱ་མེད་པའི་ཐབས་ལམ།",
    "RESET COUNTER": "གྲངས་བརྩི་སླར་སྒྲིག",
    "DARK MODE?": "མུན་པའི་ཐབས་ལམ?",
    "LIGHT MODE?": "འོད་ཀྱི་ཐབས་ལམ?",
    "CHAT HISTORY": "གླེང་མོལ་ལོ་རྒྱུས།",
    "Language": "སྐད་ཡིག",
    "Welcome,": "བསུ་བ་ཞུ།",
    "Add another account": "ཐོ་ཁུངས་གཞན་ཁ་སྐོང་།",
    "Switch Accounts": "ཐོ་ཁུངས་བརྗེ་བ།",
    "Sign-Out": "ཕྱིར་ཐོན།",
    "Recent Chats": "ཉེ་ཆར་གྱི་གླེང་མོལ།",
    "No saved chats yet.": "ད་ལྟའི་བར་གླེང་མོལ་བཞག་མི་འདུག",
    "Are you sure you want to clear this history?": "ལོ་རྒྱུས་འདི་གསལ་བཏང་ནི་ཨིན་ན?",
    "This chat will be removed from Chat History.": "གླེང་མོལ་འདི་གླེང་མོལ་ལོ་རྒྱུས་ནང་ལས་བཏོན་འོང་།",
    "No": "མེན།",
    "Yes": "ཨིན།",
    "Hello": "བཀྲ་ཤིས་བདེ་ལེགས།",
    "How can I help you with road safety today?": "ད་རིང་ལམ་སེལ་བདེ་འཇགས་ཀྱི་དོན་ལུ་ངས་ཁྱོད་ལུ་ཕན་ཐོགས་ག་དེ་སྦེ་བྱེད་ཚུགས?",
    "Upload a Photo...": "པར་ཅིག་ཡར་སྐྱེལ།...",
    "Upload a Photo and Describe the Issue...": "པར་ཅིག་ཡར་སྐྱེལ་ཞིནམ་ལས་དཀའ་ངལ་བཤད།...",
    "Type a message...": "འཕྲིན་དོན་ཅིག་ཡིག་འབྲི།...",
    "Drop image to attach to chat": "གླེང་མོལ་ནང་སྦྲགས་ནི་ལུ་པར་འདི་ནཱ་བཞག།",
    "Analyzing Road Data... ": "ལམ་སེལ་གྱི་གནད་སྡུད་དཔྱད་ཞིབ་འབད་དོ... ",
    "TICKET:": "ཊིཀེཊ:",
    "Potholes": "ས་དོང་།",
    "Severity": "ཚབས་ཆེ་ཚད།",
    "Road:": "ལམ་སེལ:",
    "Target Completion:": "དམིགས་གཏད་མཇུག་བསྡུ:",
    "CONTRACTOR": "བཀོད་ཁྱབ་པ།",
    "PROJECT ENGINEER": "ལས་འཆར་ཨིན་ཇི་ནི་ཡར།",
    "Click here to view the location on Google Maps": "Google Maps གུ་ས་གནས་བལྟ་ནི་ལུ་ནཱ་ཨེབ།",
    "REPORTS LOG": "སྙན་ཞུ་ཐོ་བཀོད།",
    "TICKETS": "ཊིཀེཊ་ཚུ།",
    "No reports generated yet.": "ད་ལྟའི་བར་སྙན་ཞུ་གཅིག་ཡང་བཟོ་མི་འདུག",
    "Reported:": "སྙན་ཞུ་བཏང་ཡོད:",
    "Just now": "ད་ལྟ།",
    "Allocated": "བཀྲམ་ཡོད།",
    "OPEN": "ཁ་ཕྱེ།",
    "Location": "ས་གནས།",
    "Potholes Detected": "ས་དོང་ཐོན་ཡོད།",
    "Confirmed by Road Inspector": "ལམ་སེལ་བལྟ་མི་གིས་གཏན་འབེབས་བྱས།",
    "Status": "གནས་སྟངས།",
    "Change?": "བསྒྱུར་བཅོས?",
    "Operations & Resource Allocation": "བཀོལ་སྤྱོད་དང་ཐོན་ཁུངས་བཀྲམ་སྤེལ།",
    "Budget Allocation (INR)": "འགྲོ་གྲོན་བཀྲམ་སྤེལ། (BTN)",
    "Repair Deadline": "བསྐྱར་གསོའི་དུས་ཚོད།",
    "Select a date...": "ཚེས་གྲངས་ཅིག་གདམ།...",
    "Save Allocations & Deadline": "བཀྲམ་སྤེལ་དང་དུས་ཚོད་བཞག།",
    "Confirm Status": "གནས་སྟངས་གཏན་འབེབས།",
    "Are you sure you want to change the status to ": "གནས་སྟངས་འདི་ལུ་བསྒྱུར་བཅོས་འབད་ནི་ཨིན་ན: ",
    "Cancel": "མཚམས་འཇོག",
    "Confirm": "གཏན་འབེབས།",
    "Chat View": "གླེང་མོལ་སྟོན།",
    "Admin View": "དོ་དམ་སྟོན།",
    "CHAT VIEW": "གླེང་མོལ་སྟོན།",
    "ADMIN VIEW": "དོ་དམ་སྟོན།",
    "Offline Mode: Site functionality is currently limited.": "དྲ་རྒྱ་མེད་པའི་ཐབས་ལམ: ད་ལྟ་དྲ་ཚིགས་ཀྱི་ལས་འགན་ཚད་བཀག་ཡོད།",
    "Localization is unavailable while offline.": "དྲ་རྒྱ་མེད་པའི་སྐབས་སུ་ས་གནས་སྒྲིག་བཀོད་ཐོབ་མི་ཚུགས།",
    "History is unavailable while offline.": "དྲ་རྒྱ་མེད་པའི་སྐབས་སུ་ལོ་རྒྱུས་ཐོབ་མི་ཚུགས།",
    "User profile is unavailable while offline.": "དྲ་རྒྱ་མེད་པའི་སྐབས་སུ་སྤྱོད་མི་མཐོང་སྣང་ཐོབ་མི་ཚུགས།",
    "BUDGET ALLOCATED": "འགྲོ་གྲོན་བཀྲམ་ཡོད།",
    "IN PROGRESS": "ལཱ་འབད་བཞིན་པ།",
    "RESOLVED": "སེལ་ཡོད།",
    "DECLINED": "བཀག་ཡོད།",
    "Only PNG and JPEG files are allowed.": "PNG དང་ JPEG ཡིག་ཆ་རྐྱངམ་ཅིག་བཅུག་ཡོད།",
    "Only 1 image can be attached at a time.": "ཐེངས་རེ་ལུ་པར་གཅིག་རྐྱངམ་ཅིག་སྦྲགས་ཚུགས།",
    "Report updated successfully!": "སྙན་ཞུ་མཐར་འཁྱོལ་ངང་གསར་བསྒྱུར་བྱས!",
    "Failed to update report.": "སྙན་ཞུ་གསར་བསྒྱུར་མ་ཚུགས།",
    "Status update timed out. Please check your connection.": "གནས་སྟངས་གསར་བསྒྱུར་དུས་ཚོད་ཚང་ཡོད། མཐུད་ལམ་བལྟ་གནང་།",
    "Failed to update status.": "གནས་སྟངས་གསར་བསྒྱུར་མ་ཚུགས།",
    "Status updated to ": "གནས་སྟངས་གསར་བསྒྱུར་བྱས: ",
    "Failed to load chat history.": "གླེང་མོལ་ལོ་རྒྱུས་ཐོབ་མ་ཚུགས།",
    "Connection restored! Syncing your data...": "མཐུད་ལམ་སླར་གསོ་བྱས! གནད་སྡུད་མཉམ་སྒྲིག་འབད་དོ...",
    "Ticket counter has been reset to 0.": "ཊིཀེཊ་གྲངས་བརྩི་ ༠ ལུ་སླར་སྒྲིག་བྱས།",
    "Failed to reset counter.": "གྲངས་བརྩི་སླར་སྒྲིག་མ་ཚུགས།",
    "Offline: Data saved locally. Auto-sync will start when online.": "དྲ་རྒྱ་མེད: གནད་སྡུད་ས་གནས་ནང་བཞག་ཡོད། དྲ་རྒྱ་ཐོབ་པའི་སྐབས་རང་བཞིན་མཉམ་སྒྲིག་འགོ་བཙུགས་འོང་།",
    "Groq AI Core Offline: Ensure your Uvicorn server is running on port 8000!": "Groq AI Core དྲ་རྒྱ་མེད: Uvicorn server Port 8000 གུ་འགོ་བཙུགས་ཡོད་གཅིག་བལྟ!",
    "Could not connect to Krater YOLO Backend": "Krater YOLO Backend ལུ་མཐུད་མ་ཚུགས།",
    "Vision Core Offline: Check your Python YOLO server!": "Vision Core དྲ་རྒྱ་མེད: Python YOLO server བལྟ!",
    "Analysis complete! I found ": "དཔྱད་ཞིབ་མཇུག་བསྡུས! ང་གིས་འཐོབ་མི་ ",
    " pothole(s) with ": " ས་དོང་ཚུ་དང་ ",
    " severity. Ticket ": " ཚབས་ཆེ་ཚད། ཊིཀེཊ ",
    " created.": " བཟོ་ཡོད།",
    "Analysis complete! I didn't find any potholes in this image. No ticket was created, as the road looks clear.": "དཔྱད་ཞིབ་མཇུག་བསྡུས! པར་འདི་ནང་ས་དོང་གཅིག་ཡང་མ་ཐོབ། ལམ་སེལ་གཙང་ཡོདཔ་ལས་ཊིཀེཊ་བཟོ་མི་འདུག",
    "Select a report from the log to view details & allocate resources.": "རྒྱས་བཤད་བལྟ་ནི་དང་ཐོན་ཁུངས་བཀྲམ་ནི་ལུ་ཐོ་བཀོད་ནང་ལས་སྙན་ཞུ་ཅིག་གདམ།",
    "Sign-In": "ནང་བསྐྱོད",
    "Register": "ཐོ་བཀོད",
    "Username": "ལག་ལེན་པའི་མིང",
    "Password": "གསང་ཡིག",
    "Confirm Password": "གསང་ཡིག་གཏན་འབེབས",
    "New User?": "ལག་ལེན་པ་གསར་པ?",
    "Already a User?": "ཧེ་མ་ལས་ལག་ལེན་པ?",
    "Location:": "ས་གནས:",
    "Report": "སྙན་ཞུ་འབད།",
    "Decline": "བཀོག་ཟོག",
    "Road Inspector": "ལམ་སེལ་ལྟ་རྟོག",
    "EST. MATERIAL": "ཚོད་དཔག་རྒྱུ་ཆས།",
    "Est. Material": "ཚོད་དཔག་རྒྱུ་ཆས།",
    "EST. COST": "ཚོད་དཔག་ཟད་འགྲོ།",
    "Est. Cost": "ཚོད་དཔག་ཟད་འགྲོ།",
    "ALLOCATED BUDGET": "བགོ་བཤའ་བརྐྱབ་མི་རྩིས་ཐོ།",
    "Allocated Budget": "བགོ་བཤའ་བརྐྱབ་མི་རྩིས་ཐོ།",
    "sq meters": "གྲུ་བཞི་མීཊར།",
    "Pending": "བསྣར་བཞག།",
    "Pending Admin": "འཛིན་སྐྱོང་པའི་བསྣར་བཞག།",
    "AI Estimated Budget (INR)": "AI ཚོད་དཔག་རྩིས་ཐོ་ (INR)",
    "Material Required (Asphalt)": "དགོས་མཁོ་ཡོད་པའི་རྒྱུ་ཆས་ (ལམ་ནག།)",


  },
  Myanmar: {
    "NEW CHAT": "စကားဝိုင်းအသစ်",
    "OFFLINE MODE": "အော့ဖ်လိုင်းမုဒ်",
    "RESET COUNTER": "ကောင်တာကို ပြန်သတ်မှတ်ရန်",
    "DARK MODE?": "အမှောင်မုဒ်?",
    "LIGHT MODE?": "အလင်းမုဒ်?",
    "CHAT HISTORY": "စကားဝိုင်းမှတ်တမ်း",
    "Language": "ဘာသာစကား",
    "Welcome,": "ကြိုဆိုပါတယ်၊",
    "Add another account": "အခြားအကောင့်တစ်ခု ထည့်ရန်",
    "Switch Accounts": "အကောင့်ပြောင်းရန်",
    "Sign-Out": "ထွက်ရန်",
    "Recent Chats": "လတ်တလော စကားဝိုင်းများ",
    "No saved chats yet.": "သိမ်းဆည်းထားသော စကားဝိုင်းများ မရှိသေးပါ။",
    "Are you sure you want to clear this history?": "ဤမှတ်တမ်းကို ရှင်းလင်းရန် သေချာပါသလား။",
    "This chat will be removed from Chat History.": "ဤစကားဝိုင်းကို စကားဝိုင်းမှတ်တမ်းမှ ဖယ်ရှားပါမည်။",
    "No": "မဟုတ်ပါ",
    "Yes": "ဟုတ်ကဲ့",
    "Hello": "မင်္ဂလာပါ",
    "How can I help you with road safety today?": "ယနေ့ လမ်းဘေးကင်းလုံခြုံရေးအတွက် ဘာကူညီပေးရမလဲ။",
    "Upload a Photo...": "ဓာတ်ပုံတင်ပါ...",
    "Upload a Photo and Describe the Issue...": "ဓာတ်ပုံတင်ပြီး ပြဿနာကို ဖော်ပြပါ...",
    "Type a message...": "စာရိုက်ပါ...",
    "Drop image to attach to chat": "စကားဝိုင်းတွင် ထည့်သွင်းရန် ပုံကို ဆွဲထည့်ပါ",
    "Analyzing Road Data... ": "လမ်းဒေတာကို ခွဲခြမ်းစိတ်ဖြာနေသည်... ",
    "TICKET:": "လက်မှတ်-",
    "Potholes": "ချိုင့်ခွက်များ",
    "Severity": "ပြင်းထန်မှု",
    "Road:": "လမ်း-",
    "Target Completion:": "ပြီးစီးမည့်ပန်းတိုင်-",
    "CONTRACTOR": "ကန်ထရိုက်တာ",
    "PROJECT ENGINEER": "ပရောဂျက်အင်ဂျင်နီယာ",
    "Click here to view the location on Google Maps": "Google Maps တွင် တည်နေရာကို ကြည့်ရန် ဤနေရာကို နှိပ်ပါ",
    "REPORTS LOG": "အစီရင်ခံစာမှတ်တမ်း",
    "TICKETS": "လက်မှတ်များ",
    "No reports generated yet.": "အစီရင်ခံစာများ မရှိသေးပါ။",
    "Reported:": "အစီရင်ခံထားသည်-",
    "Just now": "ယခုလေးတင်",
    "Allocated": "ခွဲဝေပြီး",
    "OPEN": "ဖွင့်ရန်",
    "Location": "တည်နေရာ",
    "Potholes Detected": "ချိုင့်ခွက်များ တွေ့ရှိသည်",
    "Confirmed by Road Inspector": "လမ်းစစ်ဆေးရေးမှူးမှ အတည်ပြုသည်",
    "Status": "အခြေအနေ",
    "Change?": "ပြောင်းမလား?",
    "Operations & Resource Allocation": "လုပ်ငန်းဆောင်ရွက်မှုနှင့် အရင်းအမြစ်ခွဲဝေမှု",
    "Budget Allocation (INR)": "ဘတ်ဂျက်ခွဲဝေမှု (MMK)",
    "Repair Deadline": "ပြုပြင်ရန် နောက်ဆုံးရက်",
    "Select a date...": "ရက်စွဲရွေးချယ်ပါ...",
    "Save Allocations & Deadline": "ခွဲဝေမှုနှင့် နောက်ဆုံးရက်ကို သိမ်းဆည်းရန်",
    "Confirm Status": "အခြေအနေကို အတည်ပြုရန်",
    "Are you sure you want to change the status to ": "အခြေအနေကို ပြောင်းရန် သေချာပါသလား- ",
    "Cancel": "ပယ်ဖျက်ရန်",
    "Confirm": "အတည်ပြုရန်",
    "Chat View": "စကားဝိုင်းမြင်ကွင်း",
    "Admin View": "စီမံခန့်ခွဲသူမြင်ကွင်း",
    "CHAT VIEW": "စကားဝိုင်းမြင်ကွင်း",
    "ADMIN VIEW": "စီမံခန့်ခွဲသူမြင်ကွင်း",
    "Offline Mode: Site functionality is currently limited.": "အော့ဖ်လိုင်းမုဒ်- ဝဘ်ဆိုက်၏ လုပ်ဆောင်နိုင်စွမ်း ကန့်သတ်ထားသည်။",
    "Localization is unavailable while offline.": "အော့ဖ်လိုင်းဖြစ်နေစဉ် ဘာသာစကားပြောင်း၍မရပါ။",
    "History is unavailable while offline.": "အော့ဖ်လိုင်းဖြစ်နေစဉ် မှတ်တမ်းကို ကြည့်၍မရပါ။",
    "User profile is unavailable while offline.": "အော့ဖ်လိုင်းဖြစ်နေစဉ် ပရိုဖိုင်ကို ကြည့်၍မရပါ။",
    "BUDGET ALLOCATED": "ဘတ်ဂျက်ခွဲဝေပြီး",
    "IN PROGRESS": "လုပ်ဆောင်ဆဲ",
    "RESOLVED": "ဖြေရှင်းပြီး",
    "DECLINED": "ငြင်းပယ်သည်",
    "Only PNG and JPEG files are allowed.": "PNG နှင့် JPEG ဖိုင်များကိုသာ ခွင့်ပြုသည်။",
    "Only 1 image can be attached at a time.": "တစ်ကြိမ်လျှင် ပုံ ၁ ပုံသာ ထည့်သွင်းနိုင်သည်။",
    "Report updated successfully!": "အစီရင်ခံစာကို အောင်မြင်စွာ အပ်ဒိတ်လုပ်ပြီးပါပြီ။",
    "Failed to update report.": "အစီရင်ခံစာကို အပ်ဒိတ်လုပ်ရန် မအောင်မြင်ပါ။",
    "Status update timed out. Please check your connection.": "အခြေအနေ အပ်ဒိတ်လုပ်ရန် အချိန်ကုန်သွားသည်။ ချိတ်ဆက်မှုကို စစ်ဆေးပါ။",
    "Failed to update status.": "အခြေအနေကို အပ်ဒိတ်လုပ်ရန် မအောင်မြင်ပါ။",
    "Status updated to ": "အခြေအနေကို ပြောင်းလဲပြီးပါပြီ- ",
    "Failed to load chat history.": "စကားဝိုင်းမှတ်တမ်းကို ဖွင့်ရန် မအောင်မြင်ပါ။",
    "Connection restored! Syncing your data...": "ချိတ်ဆက်မှု ပြန်လည်ရရှိပါပြီ။ ဒေတာများကို တစ်ပြိုင်တည်းလုပ်ဆောင်နေသည်...",
    "Ticket counter has been reset to 0.": "လက်မှတ်ကောင်တာကို ၀ သို့ ပြန်သတ်မှတ်ပြီးပါပြီ။",
    "Failed to reset counter.": "ကောင်တာကို ပြန်သတ်မှတ်ရန် မအောင်မြင်ပါ။",
    "Offline: Data saved locally. Auto-sync will start when online.": "အော့ဖ်လိုင်း- ဒေတာကို စက်တွင် သိမ်းဆည်းထားသည်။ အွန်လိုင်းပြန်တက်ချိန်တွင် အလိုအလျောက် တစ်ပြိုင်တည်းလုပ်ဆောင်ပါမည်။",
    "Groq AI Core Offline: Ensure your Uvicorn server is running on port 8000!": "Groq AI Core အော့ဖ်လိုင်းဖြစ်နေသည်- သင်၏ Uvicorn ဆာဗာသည် ပေါ့တ် 8000 တွင် အလုပ်လုပ်နေကြောင်း သေချာပါစေ။",
    "Could not connect to Krater YOLO Backend": "Krater YOLO Backend သို့ ချိတ်ဆက်၍မရပါ။",
    "Vision Core Offline: Check your Python YOLO server!": "Vision Core အော့ဖ်လိုင်းဖြစ်နေသည်- သင်၏ Python YOLO ဆာဗာကို စစ်ဆေးပါ။",
    "Analysis complete! I found ": "ခွဲခြမ်းစိတ်ဖြာမှု ပြီးစီးပါပြီ။ ကျွန်ုပ်တွေ့ရှိသည်မှာ ",
    " pothole(s) with ": " ချိုင့်ခွက်(များ) နှင့် ",
    " severity. Ticket ": " ပြင်းထန်မှု။ လက်မှတ် ",
    " created.": " ဖန်တီးပြီးပါပြီ။",
    "Analysis complete! I didn't find any potholes in this image. No ticket was created, as the road looks clear.": "ခွဲခြမ်းစိတ်ဖြာမှု ပြီးစီးပါပြီ။ ဤပုံတွင် ချိုင့်ခွက်များ မတွေ့ပါ။ လမ်းသည် သန့်ရှင်းနေသဖြင့် လက်မှတ်မဖန်တီးပါ။",
    "Select a report from the log to view details & allocate resources.": "အသေးစိတ်ကြည့်ရှုရန်နှင့် အရင်းအမြစ်များ ခွဲဝေရန် မှတ်တမ်းမှ အစီရင်ခံစာတစ်ခုကို ရွေးချယ်ပါ။",
    "Sign-In": "ဝင်ရောက်ရန်",
    "Register": "မှတ်ပုံတင်ရန်",
    "Username": "အသုံးပြုသူအမည်",
    "Password": "စကားဝှက်",
    "Confirm Password": "စကားဝှက်အတည်ပြုရန်",
    "New User?": "အသုံးပြုသူအသစ်?",
    "Already a User?": "အသုံးပြုသူရှိပြီးသား?",
    "Location:": "တည်နေရာ:",
    "Report": "အစီရင်ခံရန်",
    "Decline": "ပယ်ချရန်",
    "Road Inspector": "လမ်းသွားလာစစ်ဆေးရေးမှူး",
    "EST. MATERIAL": "ခန့်မှန်းခြေ ကုန်ကြမ်း",
    "Est. Material": "ခန့်မှန်းခြေ ကုန်ကြမ်း",
    "EST. COST": "ခန့်မှန်းခြေ ကုန်ကျစရိတ်",
    "Est. Cost": "ခန့်မှန်းခြေ ကုန်ကျစရိတ်",
    "ALLOCATED BUDGET": "ချထားပေးသော ဘတ်ဂျက်",
    "Allocated Budget": "ချထားပေးသော ဘတ်ဂျက်",
    "sq meters": "စတုရန်းမီတာ",
    "Pending Admin": "အက်ဒမင် စိစစ်ဆဲ",
    "AI Estimated Budget (INR)": "AI ခန့်မှန်းခြေ ဘတ်ဂျက် (INR)",
    "Material Required (Asphalt)": "လိုအပ်သော ကုန်ကြမ်း (ကတ္တရာ)",
    "Pending": "ဆိုင်းငံ့ထားဆဲ",

  },
  Thai: {
    "NEW CHAT": "แชทใหม่",
    "OFFLINE MODE": "โหมดออฟไลน์",
    "RESET COUNTER": "รีเซ็ตตัวนับ",
    "DARK MODE?": "โหมดมืด?",
    "LIGHT MODE?": "โหมดสว่าง?",
    "CHAT HISTORY": "ประวัติการแชท",
    "Language": "ภาษา",
    "Welcome,": "ยินดีต้อนรับ,",
    "Add another account": "เพิ่มบัญชีอื่น",
    "Switch Accounts": "สลับบัญชี",
    "Sign-Out": "ออกจากระบบ",
    "Recent Chats": "แชทล่าสุด",
    "No saved chats yet.": "ยังไม่มีแชทที่บันทึกไว้",
    "Are you sure you want to clear this history?": "คุณแน่ใจหรือไม่ว่าต้องการล้างประวัตินี้?",
    "This chat will be removed from Chat History.": "แชทนี้จะถูกลบออกจากประวัติการแชท",
    "No": "ไม่",
    "Yes": "ใช่",
    "Hello": "สวัสดี",
    "How can I help you with road safety today?": "วันนี้ฉันสามารถช่วยคุณเรื่องความปลอดภัยทางถนนได้อย่างไร?",
    "Upload a Photo...": "อัปโหลดรูปภาพ...",
    "Upload a Photo and Describe the Issue...": "อัปโหลดรูปภาพและอธิบายปัญหา...",
    "Type a message...": "พิมพ์ข้อความ...",
    "Drop image to attach to chat": "วางรูปภาพเพื่อแนบไปกับแชท",
    "Analyzing Road Data... ": "กำลังวิเคราะห์ข้อมูลถนน... ",
    "TICKET:": "ตั๋ว:",
    "Potholes": "หลุมบ่อ",
    "Severity": "ความรุนแรง",
    "Road:": "ถนน:",
    "Target Completion:": "เป้าหมายการเสร็จสิ้น:",
    "CONTRACTOR": "ผู้รับเหมา",
    "PROJECT ENGINEER": "วิศวกรโครงการ",
    "Click here to view the location on Google Maps": "คลิกที่นี่เพื่อดูตำแหน่งบน Google Maps",
    "REPORTS LOG": "บันทึกรายงาน",
    "TICKETS:": "ตั๋ว",
    "No reports generated yet.": "ยังไม่มีรายงานที่สร้างขึ้น",
    "Reported:": "รายงานเมื่อ:",
    "Just now": "เมื่อสักครู่นี้",
    "Allocated": "จัดสรรแล้ว",
    "OPEN": "เปิด",
    "Location": "ตำแหน่ง",
    "Potholes Detected": "ตรวจพบหลุมบ่อ",
    "Confirmed by Road Inspector": "ยืนยันโดยเจ้าหน้าที่ตรวจถนน",
    "Status": "สถานะ",
    "Change?": "เปลี่ยน?",
    "Operations & Resource Allocation": "การดำเนินงานและการจัดสรรทรัพยากร",
    "Budget Allocation (INR)": "การจัดสรรงบประมาณ (THB)",
    "Repair Deadline": "กำหนดการซ่อมแซม",
    "Select a date...": "เลือกวันที่...",
    "Save Allocations & Deadline": "บันทึกการจัดสรรและกำหนดการ",
    "Confirm Status": "ยืนยันสถานะ",
    "Are you sure you want to change the status to ": "คุณแน่ใจหรือไม่ว่าต้องการเปลี่ยนสถานะเป็น ",
    "Cancel": "ยกเลิก",
    "Confirm": "ยืนยัน",
    "Chat View": "มุมมองแชท",
    "Admin View": "มุมมองผู้ดูแลระบบ",
    "CHAT VIEW": "มุมมองแชท",
    "ADMIN VIEW": "มุมมองผู้ดูแลระบบ",
    "Offline Mode: Site functionality is currently limited.": "โหมดออฟไลน์: ฟังก์ชันการทำงานของไซต์ถูกจำกัดในขณะนี้",
    "Localization is unavailable while offline.": "ไม่สามารถเปลี่ยนภาษาได้ขณะออฟไลน์",
    "History is unavailable while offline.": "ไม่สามารถดูประวัติได้ขณะออฟไลน์",
    "User profile is unavailable while offline.": "ไม่สามารถดูโปรไฟล์ผู้ใช้ได้ขณะออฟไลน์",
    "BUDGET ALLOCATED": "งบประมาณถูกจัดสรรแล้ว",
    "IN PROGRESS": "กำลังดำเนินการ",
    "RESOLVED": "แก้ไขแล้ว",
    "DECLINED": "ปฏิเสธ",
    "Only PNG and JPEG files are allowed.": "อนุญาตเฉพาะไฟล์ PNG และ JPEG เท่านั้น",
    "Only 1 image can be attached at a time.": "สามารถแนบรูปภาพได้ครั้งละ 1 รูปเท่านั้น",
    "Report updated successfully!": "อัปเดตรายงานสำเร็จแล้ว!",
    "Failed to update report.": "อัปเดตรายงานไม่สำเร็จ",
    "Status update timed out. Please check your connection.": "การอัปเดตสถานะหมดเวลา โปรดตรวจสอบการเชื่อมต่อของคุณ",
    "Failed to update status.": "อัปเดตสถานะไม่สำเร็จ",
    "Status updated to ": "สถานะอัปเดตเป็น ",
    "Failed to load chat history.": "โหลดประวัติการแชทไม่สำเร็จ",
    "Connection restored! Syncing your data...": "กู้คืนการเชื่อมต่อแล้ว! กำลังซิงค์ข้อมูลของคุณ...",
    "Ticket counter has been reset to 0.": "ตัวนับตั๋วถูกรีเซ็ตเป็น 0 แล้ว",
    "Failed to reset counter.": "รีเซ็ตตัวนับไม่สำเร็จ",
    "Offline: Data saved locally. Auto-sync will start when online.": "ออฟไลน์: บันทึกข้อมูลไว้ในเครื่องแล้ว การซิงค์อัตโนมัติจะเริ่มขึ้นเมื่อออนไลน์",
    "Groq AI Core Offline: Ensure your Uvicorn server is running on port 8000!": "Groq AI Core ออฟไลน์: ตรวจสอบให้แน่ใจว่าเซิร์ฟเวอร์ Uvicorn ของคุณกำลังทำงานบนพอร์ต 8000!",
    "Could not connect to Krater YOLO Backend": "ไม่สามารถเชื่อมต่อกับ Krater YOLO Backend",
    "Vision Core Offline: Check your Python YOLO server!": "Vision Core ออฟไลน์: ตรวจสอบเซิร์ฟเวอร์ Python YOLO ของคุณ!",
    "Analysis complete! I found ": "การวิเคราะห์เสร็จสิ้น! ฉันพบ ",
    " pothole(s) with ": " หลุมบ่อที่มีระดับความรุนแรง ",
    " severity. Ticket ": " ตั๋วหมายเลข ",
    " created.": " ถูกสร้างขึ้นแล้ว",
    "Analysis complete! I didn't find any potholes in this image. No ticket was created, as the road looks clear.": "การวิเคราะห์เสร็จสิ้น! ฉันไม่พบหลุมบ่อในรูปภาพนี้ ไม่มีการสร้างตั๋วเนื่องจากถนนดูเรียบร้อยดี",
    "Select a report from the log to view details & allocate resources.": "เลือกรายงานจากบันทึกเพื่อดูรายละเอียดและจัดสรรทรัพยากร",
    "Sign-In": "เข้าสู่ระบบ",
    "Register": "ลงทะเบียน",
    "Username": "ชื่อผู้ใช้",
    "Password": "รหัสผ่าน",
    "Confirm Password": "ยืนยันรหัสผ่าน",
    "New User?": "ผู้ใช้ใหม่?",
    "Already a User?": "เป็นผู้ใช้อยู่แล้ว?",
    "Location:": "ตำแหน่ง:",
    "Report": "รายงาน",
    "Decline": "ยกเลิก",
    "Road Inspector": "สารวัตรทาง",
    "EST. MATERIAL": "ประมาณการวัสดุ",
    "Est. Material": "ประมาณการวัสดุ",
    "EST. COST": "ประมาณการค่าใช้จ่าย",
    "Est. Cost": "ประมาณการค่าใช้จ่าย",
    "ALLOCATED BUDGET": "งบประมาณที่ได้รับจัดสรร",
    "Allocated Budget": "งบประมาณที่ได้รับจัดสรร",
    "sq meters": "ตารางเมตร",
    "Pending": "รอดำเนินการ",
    "Pending Admin": "รอผู้ดูแลระบบอนุมัติ",
    "AI Estimated Budget (INR)": "ประมาณการงบประมาณโดย AI (INR)",
    "Material Required (Asphalt)": "วัสดุที่จำเป็น (ยางมะตอย)",


  }
};

const resizeImage = (base64Str, maxWidth = 400, maxHeight = 400) => {
  return new Promise((resolve) => {
    let img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      let ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
  });
};

function App() {

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState(() => {
    const saved = localStorage.getItem('krater_saved_accounts');
    return saved ? JSON.parse(saved) : [];
  });
  const [hoveredSavedAccount, setHoveredSavedAccount] = useState(null);
  const [hoveredDeleteSavedAccount, setHoveredDeleteSavedAccount] = useState(null);


  const [showLanding, setShowLanding] = useState(true);
  const [userRole, setUserRole] = useState('citizen');
  const [currentStep, setCurrentStep] = useState(() => localStorage.getItem('krater_step') || 'upload');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [ticketLocation, setTicketLocation] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [specificLocation, setSpecificLocation] = useState("");

  const [showMap, setShowMap] = useState(false);
  const [pinLocation, setPinLocation] = useState({
    latitude: 26.9124,
    longitude: 75.7873
  });


  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

  const fetchRoadClassification = async (lng, lat) => {
    try {

      const overpassQuery = `
        [out:json];
        way(around:30, ${lat}, ${lng})["highway"];
        out tags;
      `;

      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
      const data = await response.json();

      if (data.elements && data.elements.length > 0) {

        const tags = data.elements[0].tags;
        let classification = "Municipal Road";


        if (tags.ref) {
          if (tags.ref.toUpperCase().includes("NH")) classification = "National Highway";
          else if (tags.ref.toUpperCase().includes("SH")) classification = "State Highway";
        }

        else if (tags.highway === "trunk" || tags.highway === "motorway") {
          classification = "National Highway";
        } else if (tags.highway === "primary") {
          classification = "State Highway";
        }

        return classification;
      }
      return "Municipal Road";
    } catch (error) {
      console.error("OSM API Error:", error);
      return "Municipal Road";
    }
  };



  const updateLocationFromCoords = async (lng, lat) => {
    setPinLocation({ longitude: lng, latitude: lat });

    try {

      const mapboxRes = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
      );
      const mapboxData = await mapboxRes.json();

      if (mapboxData.features && mapboxData.features.length > 0) {
        const place = mapboxData.features[0];
        const streetName = place.text;
        const fullAddress = place.place_name;


        const roadType = await fetchRoadClassification(lng, lat);



        setSpecificLocation(`[${roadType}] ${streetName} - ${fullAddress}`);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };


  const fallbackToDeviceLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocationFromCoords(position.coords.longitude, position.coords.latitude);
        },
        (error) => {
          console.warn("Geolocation blocked or failed. Defaulting to fallback coordinates.", error);
        }
      );
    }
  };


  const handlePinDrop = (e) => {
    updateLocationFromCoords(e.lngLat.lng, e.lngLat.lat);
  };
  const knownDistricts = [
    "Adilabad",
    "Agar Malwa",
    "Agra",
    "Ahmedabad",
    "Ahmednagar",
    "Aizawl",
    "Ajmer",
    "Akola",
    "Alappuzha",
    "Aligarh",
    "Alipurduar",
    "Alirajpur",
    "Alluri Sitharama Raju",
    "Almora",
    "Alwar",
    "Ambala",
    "Ambedkar Nagar",
    "Amethi",
    "Amravati",
    "Amreli",
    "Amritsar",
    "Amroha",
    "Anakapalli",
    "Anand",
    "Ananthapuramu",
    "Anantnag",
    "Angul",
    "Anjaw",
    "Annamayya",
    "Anuppur",
    "Anupgarh",
    "Araria",
    "Aravalli",
    "Arwal",
    "Ashoknagar",
    "Auraiya",
    "Aurangabad",
    "Ayodhya",
    "Azamgarh",
    "Bagalkot",
    "Bageshwar",
    "Baghpat",
    "Bahraich",
    "Bajali",
    "Baksa",
    "Balaghat",
    "Balangir",
    "Balod",
    "Baloda Bazar",
    "Balotra",
    "Balrampur - CG",
    "Balrampur - UP",
    "Banaskantha",
    "Banda",
    "Bandipora",
    "Bankura",
    "Banka",
    "Banswara",
    "Bapatla",
    "Barabanki",
    "Baramulla",
    "Baran",
    "Bareilly",
    "Bargarh",
    "Barmer",
    "Barnala",
    "Barpeta",
    "Barwani",
    "Bastar",
    "Basti",
    "Bathinda",
    "Baudh",
    "Beawar",
    "Beed",
    "Begusarai",
    "Belagavi",
    "Bemetara",
    "Bengaluru Rural",
    "Bengaluru Urban",
    "Betul",
    "Bhadohi",
    "Bhadradri Kothagudem",
    "Bhadrak",
    "Bhagalpur",
    "Bharatpur",
    "Bharuch",
    "Bhavnagar",
    "Bhilwara",
    "Bhind",
    "Bhiwani",
    "Bhojpur",
    "Bhopal",
    "Bishnupur",
    "Biswanath",
    "Bijnor",
    "Bikaner",
    "Bilaspur - HP",
    "Bilaspur - CG",
    "Bokaro",
    "Bongaigaon",
    "Botad",
    "Budaun",
    "Budgam",
    "Bulandshahr",
    "Bundi",
    "Burhanpur",
    "Buxar",
    "Cachar",
    "Central Delhi",
    "Chachoura",
    "Chamarajanagar",
    "Chamba",
    "Chamoli",
    "Champawat",
    "Champhai",
    "Chandauli",
    "Chandel",
    "Chandigarh",
    "Chandrapur",
    "Changlang",
    "Charaideo",
    "Charkhi Dadri",
    "Chatra",
    "Chhatrapati Sambhajinagar",
    "Chhatarpur",
    "Chengalpattu",
    "Chennai",
    "Chhota Udepur",
    "Chhindwara",
    "Chikkaballapur",
    "Chikkamagaluru",
    "Chirang",
    "Chitrakoot",
    "Chitradurga",
    "Chittoor",
    "Chowkham",
    "Churu",
    "Churachandpur",
    "Chümoukedima",
    "Coimbatore",
    "Cooch Behar",
    "Cuddalore",
    "Cuttack",
    "Dadra and Nagar Haveli",
    "Dahod",
    "Dakshin Dinajpur",
    "Dakshina Kannada",
    "Daman",
    "Damoh",
    "Dang",
    "Dantewada",
    "Darbhanga",
    "Darjeeling",
    "Darrang",
    "Datia",
    "Dausa",
    "Davanagere",
    "Deeg",
    "Dehradun",
    "Deoghar",
    "Deogarh",
    "Deoria",
    "Devbhumi Dwarka",
    "Dewas",
    "Dhalai",
    "Dhamtari",
    "Dhanbad",
    "Dhar",
    "Dharmapuri",
    "Dharwad",
    "Dhemaji",
    "Dholpur",
    "Dhule",
    "Dhubri",
    "Dibang Valley",
    "Dibrugarh",
    "Didwana-Kuchaman",
    "Dima Hasao",
    "Dimapur",
    "Dindigul",
    "Dindori",
    "Diu",
    "Doda",
    "Dr. B.R. Ambedkar Konaseema",
    "Dudu",
    "Dumka",
    "Dungarpur",
    "Durg",
    "East Champaran",
    "East Delhi",
    "East Garo Hills",
    "East Jaintia Hills",
    "East Kameng",
    "East Khasi Hills",
    "East Siang",
    "East Singhbhum",
    "Eastern West Khasi Hills",
    "Eluru",
    "Ernakulam",
    "Erode",
    "Etah",
    "Etawah",
    "Faridabad",
    "Farrukhabad",
    "Fatehabad",
    "Fatehgarh Sahib",
    "Fatehpur",
    "Fazilka",
    "Ferozepur",
    "Firozabad",
    "Gadag",
    "Gadchiroli",
    "Gajapati",
    "Ganderbal",
    "Gandhinagar",
    "Gangapur City",
    "Gangtok",
    "Ganjam",
    "Gariaband",
    "Garhwa",
    "Gautam Buddha Nagar",
    "Gaurela-Pendra-Marwahi",
    "Gaya",
    "Ghaziabad",
    "Ghazipur",
    "Gir Somnath",
    "Giridih",
    "Goalpara",
    "Godda",
    "Golaghat",
    "Gomati",
    "Gonda",
    "Gondia",
    "Gopalganj",
    "Gorakhpur",
    "Gumla",
    "Guna",
    "Guntur",
    "Gurugram",
    "Gurdaspur",
    "Gwalior",
    "Gyalshing",
    "Hailakandi",
    "Hamirpur - HP",
    "Hamirpur - UP",
    "Hanamkonda",
    "Hanumangarh",
    "Hapur",
    "Harda",
    "Hardoi",
    "Haridwar",
    "Hassan",
    "Hathras",
    "Haveri",
    "Hingoli",
    "Hisar",
    "Hnahthial",
    "Hojai",
    "Hooghly",
    "Hoshiarpur",
    "Howrah",
    "Hyderabad",
    "Idukki",
    "Imphal East",
    "Imphal West",
    "Indore",
    "Jabalpur",
    "Jagatsinghpur",
    "Jagtial",
    "Jaipur",
    "Jaipur Rural",
    "Jaisalamer",
    "Jajpur",
    "Jalaun",
    "Jalandhar",
    "Jalgaon",
    "Jalna",
    "Jalpaiguri",
    "Jammu",
    "Jamnagar",
    "Jamtara",
    "Jamui",
    "Jangaon",
    "Janjgir-Champa",
    "Jashpur",
    "Jaunpur",
    "Jayashankar Bhupalpally",
    "Jehanabad",
    "Jhajjar",
    "Jhalawar",
    "Jhansi",
    "Jhargram",
    "Jharsuguda",
    "Jhabua",
    "Jhunjhunu",
    "Jind",
    "Jiribam",
    "Jodhpur",
    "Jodhpur Rural",
    "Jogulamba Gadwal",
    "Jorhat",
    "Junagadh",
    "Kaimur",
    "Kaithal",
    "Kakinada",
    "Kakching",
    "Kalaburagi",
    "Kalahandi",
    "Kalimpong",
    "Kallakurichi",
    "Kamareddy",
    "Kamjong",
    "Kamle",
    "Kamrup",
    "Kamrup Metropolitan",
    "Kanchipuram",
    "Kandhamal",
    "Kangra",
    "Kangpokpi",
    "Kanker",
    "Kannauj",
    "Kannur",
    "Kanpur Dehat",
    "Kanpur Nagar",
    "Kanyakumari",
    "Kapurthala",
    "Karaikal",
    "Karauli",
    "Karbi Anglong",
    "Kargil",
    "Karimganj",
    "Karimnagar",
    "Karnal",
    "Karur",
    "Kasaragod",
    "Kasganj",
    "Katihar",
    "Katni",
    "Kaushambi",
    "Kawardha",
    "Kekri",
    "Kendrapara",
    "Kendujhar",
    "Khagaria",
    "Khairthal-Tijara",
    "Khammam",
    "Khandwa",
    "Khargone",
    "Khawzawl",
    "Kheda",
    "Khordha",
    "Khunti",
    "Khowai",
    "Kinnaur",
    "Kiphire",
    "Kishanganj",
    "Kishtwar",
    "Kodagu",
    "Koderma",
    "Kohima",
    "Kolar",
    "Kolasib",
    "Kolkata",
    "Kollam",
    "Kondagaon",
    "Koppal",
    "Koraput",
    "Korba",
    "Koriya",
    "Kota",
    "Kotputli-Behror",
    "Kottayam",
    "Kozhikode",
    "Kra Daadi",
    "Krishna",
    "Krishnagiri",
    "Kulgam",
    "Kullu",
    "Kumuram Bheem Asifabad",
    "Kupwara",
    "Kurnool",
    "Kurukshetra",
    "Kurung Kumey",
    "Kushinagar",
    "Kutch",
    "Lahaul and Spiti",
    "Lakhimpur",
    "Lakhimpur Kheri",
    "Lakhisarai",
    "Lakshadweep",
    "Lalitpur",
    "Latur",
    "Latehar",
    "Lawngtlai",
    "Leh",
    "Lepa Rada",
    "Lohardaga",
    "Lohit",
    "Longding",
    "Longleng",
    "Lucknow",
    "Ludhiana",
    "Lunglei",
    "Madhepura",
    "Madhubani",
    "Madurai",
    "Mahabubabad",
    "Mahabubnagar",
    "Maharajganj",
    "Mahasamund",
    "Mahe",
    "Mahendragarh",
    "Mahisagar",
    "Mahoba",
    "Maihar",
    "Mainpuri",
    "Majuli",
    "Malappuram",
    "Malda",
    "Malerkotla",
    "Malkangiri",
    "Mamit",
    "Mancherial",
    "Mandla",
    "Mandsaur",
    "Mandya",
    "Manendragarh-Chirmiri-Bharatpur",
    "Mangan",
    "Mansi",
    "Mathura",
    "Mau",
    "Mauganj",
    "Mayiladuthurai",
    "Mayurbhanj",
    "Medak",
    "Medchal-Malkajgiri",
    "Meerut",
    "Mehsana",
    "Mirzapur",
    "Moga",
    "Mohla-Manpur-Ambagarh Chowki",
    "Mokokchung",
    "Mon",
    "Moradabad",
    "Morbi",
    "Morigaon",
    "Morena",
    "Mumbai City",
    "Mumbai Suburban",
    "Mulugu",
    "Munger",
    "Mungeli",
    "Murshidabad",
    "Muzaffarnagar",
    "Muzaffarpur",
    "Mysuru",
    "Nabarangpur",
    "Nadia",
    "Nagaon",
    "Nagapattinam",
    "Nagda",
    "Nagarkurnool",
    "Nagaur",
    "Nagpur",
    "Nainital",
    "Nalanda",
    "Nalbari",
    "Nalgonda",
    "Namakkal",
    "Namchi",
    "Namsai",
    "Nanded",
    "Nandurbar",
    "Nandyal",
    "Narayanpet",
    "Narayanpur",
    "Narmada",
    "Narmadapuram",
    "Narsinghpur",
    "Nashik",
    "Navsari",
    "Nawada",
    "Nayagarh",
    "Neem Ka Thana",
    "Neemuch",
    "New Delhi",
    "Nicobar",
    "Nilgiris",
    "Nirmal",
    "Niuland",
    "Niwari",
    "Nizamabad",
    "Noklak",
    "Noney",
    "North 24 Parganas",
    "North and Middle Andaman",
    "North Delhi",
    "North East Delhi",
    "North Garo Hills",
    "North Goa",
    "North Tripura",
    "North West Delhi",
    "NTR",
    "Nuapada",
    "Nuh",
    "Osmanabad",
    "Pakke Kessang",
    "Pakur",
    "Pakyong",
    "Palakkad",
    "Palamu",
    "Palghar",
    "Pali",
    "Palnadu",
    "Palwal",
    "Panchkula",
    "Panchmahal",
    "Panipat",
    "Panna",
    "Papum Pare",
    "Parbhani",
    "Parvathipuram Manyam",
    "Paschim Bardhaman",
    "Paschim Medinipur",
    "Patan",
    "Pathanamthitta",
    "Pathankot",
    "Patiala",
    "Patna",
    "Pauri Garhwal",
    "Peddapalli",
    "Perambalur",
    "Peren",
    "Phek",
    "Pherzawl",
    "Phalodi",
    "Pilibhit",
    "Pithoragarh",
    "Poonch",
    "Porbandar",
    "Prakasam",
    "Pratapgarh - RJ",
    "Pratapgarh - UP",
    "Prayagraj",
    "Puducherry",
    "Pudukkottai",
    "Pulwama",
    "Pune",
    "Purba Bardhaman",
    "Purba Medinipur",
    "Puri",
    "Purnia",
    "Purulia",
    "Raebareli",
    "Raichur",
    "Raigarh",
    "Raigad",
    "Raipur",
    "Raisen",
    "Rajanna Sircilla",
    "Rajgarh",
    "Rajkot",
    "Rajnandgaon",
    "Rajouri",
    "Rajsamand",
    "Ramanagara",
    "Ramanathapuram",
    "Ramban",
    "Ramgarh",
    "Rampur",
    "Ranchi",
    "Rangareddy",
    "Ranipet",
    "Ratlam",
    "Ratnagiri",
    "Rayagada",
    "Reasi",
    "Rewa",
    "Rewari",
    "Ri Bhoi",
    "Rohtak",
    "Rohtas",
    "Rudraprayag",
    "Rupnagar",
    "Sabarkantha",
    "Sagar",
    "Saharanpur",
    "Saharsa",
    "Sahibganj",
    "Sahibzada Ajit Singh Nagar",
    "Saiha",
    "Saitual",
    "Sakti",
    "Salem",
    "Salumbar",
    "Samastipur",
    "Samba",
    "Sambalpur",
    "Sambhal",
    "Sanchore",
    "Sangareddy",
    "Sangli",
    "Sangrur",
    "Sant Kabir Nagar",
    "Saran",
    "Sarangarh-Bilaigarh",
    "Satara",
    "Satna",
    "Sawai Madhopur",
    "Sehore",
    "Senapati",
    "Seoni",
    "Sepahijala",
    "Seraikela Kharsawan",
    "Serchhip",
    "Shahdara",
    "Shahdol",
    "Shahid Bhagat Singh Nagar",
    "Shahjahanpur",
    "Shahpura",
    "Shajapur",
    "Shamator",
    "Shamli",
    "Sheohar",
    "Sheopur",
    "Sheikhpura",
    "Shi Yomi",
    "Shimla",
    "Shivamogga",
    "Shivpuri",
    "Shopian",
    "Shravasti",
    "Siang",
    "Siddharthnagar",
    "Siddipet",
    "Sidhi",
    "Sikar",
    "Simdega",
    "Sindhudurg",
    "Singrauli",
    "Sirmaur",
    "Sirohi",
    "Sirsa",
    "Sitamarhi",
    "Sitapur",
    "Sivaganga",
    "Sivasagar",
    "Siwan",
    "Solan",
    "Solapur",
    "Sonbhadra",
    "Sonipat",
    "Sonitpur",
    "Soreng",
    "South 24 Parganas",
    "South Andaman",
    "South Delhi",
    "South East Delhi",
    "South Garo Hills",
    "South Goa",
    "South Salmara-Mankachar",
    "South Tripura",
    "South West Delhi",
    "South West Garo Hills",
    "South West Khasi Hills",
    "Sri Ganganagar",
    "Sri Madhopur",
    "Sri Muktsar Sahib",
    "Sri Potti Sriramulu Nellore",
    "Sri Sathya Sai",
    "Srikakulam",
    "Srinagar",
    "Subarnapur",
    "Sukma",
    "Sultanpur",
    "Sundargarh",
    "Supaul",
    "Surajpur",
    "Surat",
    "Surendranagar",
    "Surguja",
    "Suryapet",
    "Tamenglong",
    "Tapi",
    "Tarntaran",
    "Tawang",
    "Tehri Garhwal",
    "Tenkasi",
    "Tengnoupal",
    "Thane",
    "Thanjavur",
    "Theni",
    "Thiruvananthapuram",
    "Thoothukudi",
    "Thoubal",
    "Thrissur",
    "Tikamgarh",
    "Tinsukia",
    "Tirap",
    "Tiruchirappalli",
    "Tirunelveli",
    "Tirupathur",
    "Tirupati",
    "Tiruppur",
    "Tiruvallur",
    "Tiruvannamalai",
    "Tiruvarur",
    "Tonk",
    "Tseminyu",
    "Tuensang",
    "Tumakuru",
    "Udaipur",
    "Udalguri",
    "Udham Singh Nagar",
    "Udhampur",
    "Udupi",
    "Ujjain",
    "Ukhrul",
    "Umaria",
    "Unakoti",
    "Unnao",
    "Upper Siang",
    "Upper Subansiri",
    "Uttar Dinajpur",
    "Uttara Kannada",
    "Uttarkashi",
    "Vadodara",
    "Vaishali",
    "Valsad",
    "Varanasi",
    "Vellore",
    "Vikarabad",
    "Vijayapura",
    "Vijayanagara",
    "Vizianagaram",
    "Viluppuram",
    "Virudhunagar",
    "Visakhapatnam",
    "Wanaparthy",
    "Warangal",
    "Wardha",
    "Washim",
    "Wayanad",
    "West Champaran",
    "West Delhi",
    "West Garo Hills",
    "West Godavari",
    "West Jaintia Hills",
    "West Kameng",
    "West Karbi Anglong",
    "West Khasi Hills",
    "West Siang",
    "West Singhbhum",
    "West Tripura",
    "Wokha",
    "Yadadri Bhuvanagiri",
    "Yadgir",
    "Yanam",
    "Yavatmal",
    "YSR Kadapa",
    "Zunheboto"
  ];
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('krater_darkmode') === 'true');


  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isHoveringHistory, setIsHoveringHistory] = useState(false);
  const [hoveredChatId, setHoveredChatId] = useState(null);
  const [hoveredDeleteChatId, setHoveredDeleteChatId] = useState(null);
  const [deleteTargetChatId, setDeleteTargetChatId] = useState(null);
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);
  const messagesEndRef = useRef(null);
  const chatScrollRef = useRef(null);
  const historyAreaRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);
  const activeChatIdRef = useRef(null);
  const rightPanelRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const calendarRef = useRef(null);


  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isHoveringAdd, setIsHoveringAdd] = useState(false);
  const [isHoveringSwitch, setIsHoveringSwitch] = useState(false);
  const [isHoveringSignOut, setIsHoveringSignOut] = useState(false);
  const [isHoveringReset, setIsHoveringReset] = useState(false);


  const [viewMode, setViewMode] = useState('chat');
  const [adminTickets, setAdminTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [budgetAllocation, setBudgetAllocation] = useState(0);
  const [manualDeadline, setManualDeadline] = useState('');
  const [isHoveringAdminToggle, setIsHoveringAdminToggle] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [newStatusTarget, setNewStatusTarget] = useState('');
  const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [budget, setBudget] = useState(0);
  const [material, setMaterial] = useState(0);
  const [showInspectorDropdown, setShowInspectorDropdown] = useState(false);
  const [selectedInspector, setSelectedInspector] = useState('--Select--');
  const [actionModal, setActionModal] = useState({ visible: false, type: null });
  const inspectorDropdownRef = useRef(null);


  const [isHoveringNew, setIsHoveringNew] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: '' });
  const [isHoveringDarkToggle, setIsHoveringDarkToggle] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [language, setLanguage] = useState('English');
  const [isHoveringLanguage, setIsHoveringLanguage] = useState(false);
  const languageMenuRef = useRef(null);

  const fontLogo = '"Engravers MT", serif';
  const fontPrimary = (language === 'Hindi' || language === 'Nepali' || language === 'Marathi' || language === 'Rajasthani' || language === 'Bhojpuri') ? '"Poppins", sans-serif' :
    language === 'Bengali' ? '"Hind Siliguri", sans-serif' :
      language === 'Sinhala' ? '"Hind Madurai", sans-serif' :
        language === 'Dzongkha' ? '"Noto Serif Tibetan", serif' :
          language === 'Myanmar' ? '"Noto Sans Myanmar", sans-serif' :
            language === 'Thai' ? '"Prompt", sans-serif' :
              language === 'Tamil' ? '"Mukta Malar", sans-serif' :
                language === 'Telugu' ? '"Hind Guntur", sans-serif' :
                  language === 'Odia' ? '"Mukta Mahee", sans-serif' :
                    '"Century Gothic", sans-serif';
  const fontSecondary = (language === 'Hindi' || language === 'Nepali') ? '"Yatra One", serif' : language === 'Bengali' ? '"Tiro Bangla", serif' : language === 'Sinhala' ? '"Abhaya Libre", serif' : language === 'Dzongkha' ? '"Jomolhari", serif' : language === 'Myanmar' ? '"Padauk", serif' : language === 'Thai' ? '"Noto Serif Thai", serif' : '"Engravers MT", serif';

  const languageLabels = {
    English: "English",
    Hindi: "हिन्दी",
    Bengali_India: "বাঙালি_ভারত",
    Bengali_Bangladesh: "বাংলা_বাংলাদেশ",
    Marathi: "मराठी",
    Tamil: "தமிழ்",
    Telugu: "తెలుగు",
    Odia: "ଓଡ଼ିଆ",
    Rajasthani: "राजस्थानी",
    Bhojpuri: "भोजपुरी",
    Nepali: "नेपाली",
    Sinhala: "සිංහල",
    Dzongkha: "རྫོང་ཁ",
    Myanmar: "မြန်မာ",
    Thai: "ไทย"

  };

  const inspectors = [
    "Akhilesh Kumar",
    "Sanjay Jha",
    "Himanshu Dewangan",
    "Irfan Warashi",
    "Deepak Bansal",
    "Shashank Goliya",
    "Yogesh Nagpure",
    "Mohammad Imran",
    "T. Rozama",
    "Chetan Bisoi",
    "Ramesh Jain",
    "Amarender Singh",
    "Tuhin Choudhury",
    "C. V. Sriniwas",
    "Ningthoujam Thoibisana",
    "Mary Bernerdit",
    "Chinnana Gouda",
    "H. Narayanappa",
    "George Chakko",
    "Vilas Patil"
  ];

  const t = (text) => {
    if (language === 'English') return text;
    return translations[language]?.[text] || text;
  };


  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('resize', handleResize);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  useEffect(() => {
    if (isOnline && pendingMessages.length > 0) {
      const hasImage = pendingMessages.some(m => m.image);
      if (hasImage && selectedFile) {
        handleStartScan(pendingMessages, selectedFile);
      } else {
        const lastUserMsg = pendingMessages.filter(m => m.sender === 'user').pop();
        handleChatReply(pendingMessages, lastUserMsg?.text || "Hello");
      }
      setPendingMessages([]);
      setNotification({ visible: true, message: t("Connection restored! Syncing your data...") });
      setTimeout(() => setNotification({ visible: false, message: "" }), 3000);
    }
  }, [isOnline, pendingMessages]);

  useEffect(() => {
    if (userRole === 'admin') {
      setViewMode('admin');
    } else {
      setViewMode('chat');
    }
  }, [userRole]);

  useEffect(() => {
    if (viewMode === 'admin') {
      setIsAdminLoading(true);
      const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(ticket => {
          if (ticket.isConfirmed === false && ticket.declinedAt) {
            const declinedTime = ticket.declinedAt.toMillis ? ticket.declinedAt.toMillis() : ticket.declinedAt.seconds * 1000;
            const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
            if (Date.now() - declinedTime > twoWeeksInMs) return false;
          }
          return true;
        });
        setAdminTickets(tickets);
        setIsAdminLoading(false);
      }, (error) => {
        console.error("Error fetching tickets:", error);
        setIsAdminLoading(false);
      });
      return () => unsubscribe();
    }
  }, [viewMode]);

  useEffect(() => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setAuthError('');
  }, [authMode]);

  const fileInputRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setChatHistory([]);
      return;
    }
    const q = query(
      collection(db, "chats"),
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => {
        const data = doc.data();
        let timestamp = Date.now();
        if (typeof data.updatedAt === 'number') timestamp = data.updatedAt;
        else if (data.updatedAt?.toMillis) timestamp = data.updatedAt.toMillis();
        return { id: doc.id, ...data, updatedAt: timestamp };
      });
      setChatHistory(chats);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {

        setShowLanding(false);


        const email = currentUser.email ? currentUser.email.toLowerCase() : '';
        if (email.includes('inspector')) {
          setUserRole('inspector');
        } else if (email.includes('admin') || currentUser.displayName === 'zxczxc' || currentUser.displayName === 'Twillight' || currentUser.displayName === 'SubZeroAura') {
          setUserRole('admin');
        } else {
          setUserRole('citizen');
        }
      }

      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('krater_step', currentStep);
    if (previewImage) localStorage.setItem('krater_preview', previewImage);
    localStorage.setItem('krater_darkmode', isDarkMode);
  }, [currentStep, previewImage, isDarkMode]);

  useEffect(() => {
    localStorage.setItem('krater_saved_accounts', JSON.stringify(savedAccounts));
  }, [savedAccounts]);

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    document.body.style.height = isMobile ? "100dvh" : "100vh";
    document.body.style.width = "100vw";
    document.body.style.backgroundColor = isDarkMode ? '#1e293b' : '#fff';
    document.body.style.transition = 'background-color 0.3s ease';
    document.body.style.fontFamily = '"Century Gothic", sans-serif';
  }, [isDarkMode]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (historyAreaRef.current && !historyAreaRef.current.contains(event.target)) setShowHistory(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setShowUserMenu(false);
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) setShowLanguageMenu(false);
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) setShowStatusDropdown(false);
      if (calendarRef.current && !calendarRef.current.contains(event.target)) setShowCalendar(false);
      if (inspectorDropdownRef.current && !inspectorDropdownRef.current.contains(event.target)) setShowInspectorDropdown(false);
    }
    if (showUserMenu || showHistory || showLanguageMenu || showStatusDropdown || showCalendar || showInspectorDropdown) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu, showHistory, showLanguageMenu, showStatusDropdown, showCalendar, showInspectorDropdown]);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }, [messages, isScanning, previewImage, viewMode]);

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setBudgetAllocation(ticket.budget || 0);
    setManualDeadline(ticket.deadline || calculateAutoDeadline(ticket.severity));
    setSelectedInspector(ticket.inspector || '--Select--');
  };

  const calculateAutoDeadline = (severity) => {
    const today = new Date();
    let daysToAdd = 30;
    if (severity === 'CRITICAL 🚨') daysToAdd = 3;
    else if (severity === 'HIGH') daysToAdd = 7;
    else if (severity === 'MODERATE') daysToAdd = 14;
    else if (severity === 'LOW') daysToAdd = 30;

    today.setDate(today.getDate() + daysToAdd);
    return today.toISOString().split('T')[0];
  };

  const saveAdminChanges = async () => {
    if (!selectedTicket) return;
    try {
      await setDoc(doc(db, "tickets", selectedTicket.id), {
        budget: budgetAllocation,
        deadline: manualDeadline,
        status: budgetAllocation > 0 ? 'budget allocated' : selectedTicket.status,
        inspector: selectedInspector
      }, { merge: true });
      showToast(t("Report updated successfully!"));
      setSelectedTicket(prev => ({
        ...prev,
        budget: budgetAllocation,
        deadline: manualDeadline,
        status: budgetAllocation > 0 ? 'budget allocated' : prev.status,
        inspector: selectedInspector
      }));
    } catch (error) {
      console.error("Error updating ticket:", error);
      showToast(t("Failed to update report."));
    }
  };

  const handleConfirmTicket = async () => {
    if (!selectedTicket) return;
    try {

      const isFullyConfirmed = selectedTicket.inspectorConfirmed === true;


      const payload = {
        adminConfirmed: true,
        adminConfirmedAt: serverTimestamp()
      };


      if (isFullyConfirmed) {
        payload.isConfirmed = true;
        payload.status = "open";
        payload.confirmedAt = serverTimestamp();
      }

      await setDoc(doc(db, "tickets", selectedTicket.id), payload, { merge: true });

      showToast(isFullyConfirmed ? t("Ticket fully confirmed and opened!") : t("Admin confirmation saved! Waiting on Inspector."));

      setSelectedTicket(prev => ({ ...prev, ...payload }));
      setActionModal({ visible: false, type: null });
    } catch (error) { console.error("Error confirming:", error); }
  };

  const handleDeclineTicket = async () => {
    if (!selectedTicket) return;
    try {
      await setDoc(doc(db, "tickets", selectedTicket.id), {
        adminConfirmed: false,
        isConfirmed: false,
        status: "declined",
        declinedAt: serverTimestamp()
      }, { merge: true });

      showToast(t("Ticket ") + selectedTicket.ticketLabel + t(" is declined."));
      setSelectedTicket(prev => ({ ...prev, adminConfirmed: false, isConfirmed: false, status: 'declined' }));
      setActionModal({ visible: false, type: null });
    } catch (error) { console.error("Error declining:", error); }
  };

  const handleStatusChange = async () => {
    if (!selectedTicket || !newStatusTarget) return;
    setIsStatusUpdating(true);


    const timeoutId = setTimeout(() => {
      setIsStatusUpdating(false);
      setShowStatusConfirmModal(false);
      setNotification({ visible: true, message: t("Status update timed out. Please check your connection.") });
      setTimeout(() => setNotification({ visible: false, message: "" }), 3000);
    }, 10000);

    try {
      await setDoc(doc(db, "tickets", selectedTicket.id), {
        status: newStatusTarget
      }, { merge: true });
      clearTimeout(timeoutId);
      setSelectedTicket(prev => ({ ...prev, status: newStatusTarget }));
      showToast(`${t("Status updated to ")}${t(newStatusTarget.toUpperCase())}`);
      setShowStatusConfirmModal(false);
    } catch (error) {
      console.error("Status update error:", error);
      clearTimeout(timeoutId);
      showToast(t("Failed to update status."));
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleRightPanelMouseMove = (e) => {
    if (!rightPanelRef.current || isMobile) return;

    const panel = rightPanelRef.current;
    if (panel.scrollHeight <= panel.clientHeight) return;

    const rect = panel.getBoundingClientRect();
    let relativeY = (e.clientY - rect.top) / rect.height;


    if (relativeY < 0.05) relativeY = 0;
    else if (relativeY > 0.95) relativeY = 1;
    else relativeY = (relativeY - 0.05) / 0.9;

    const maxScroll = panel.scrollHeight - panel.clientHeight;
    panel.scrollTop = relativeY * maxScroll;
  };

  const renderCustomCalendar = () => {
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);

    const changeMonth = (offset) => {
      const nextDate = new Date(year, month + offset, 1);
      setCalendarViewDate(nextDate);
    };

    const selectDate = (day) => {
      const selected = new Date(year, month, day);
      setManualDeadline(selected.toISOString().split('T')[0]);
      setShowCalendar(false);
    };

    return (
      <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: '10px', width: '280px', backgroundColor: colors.panel, border: `1px solid ${colors.border}`, borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', padding: '15px', zIndex: 1000, animation: 'fadeInUp 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', color: colors.text, cursor: 'pointer', fontSize: '1.2rem' }}>‹</button>
          <div style={{ fontWeight: 'bold', fontSize: '1rem', color: colors.text }}>{monthNames[month]} {year}</div>
          <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', color: colors.text, cursor: 'pointer', fontSize: '1.2rem' }}>›</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center' }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} style={{ fontSize: '0.75rem', color: colors.subtext, fontWeight: 'bold', marginBottom: '5px' }}>{d}</div>)}
          {days.map((d, i) => (
            <div key={i} onClick={() => d && selectDate(d)} style={{
              padding: '8px 0', fontSize: '0.9rem', cursor: d ? 'pointer' : 'default', borderRadius: '6px',
              backgroundColor: d && manualDeadline === new Date(year, month, d).toISOString().split('T')[0] ? colors.accent : 'transparent',
              color: d && manualDeadline === new Date(year, month, d).toISOString().split('T')[0] ? '#fff' : (d ? colors.text : 'transparent'),
              transition: 'all 0.2s'
            }}>
              {d}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleAuthAction = async (unameOpt, pwdOpt) => {
    setAuthError('');
    setIsAuthProcessing(true);
    const u = typeof unameOpt === 'string' ? unameOpt : username;
    const p = typeof pwdOpt === 'string' ? pwdOpt : password;
    const cleanName = u.trim();
    const lowerName = cleanName.toLowerCase();

    if (!cleanName || !p) {
      setAuthError("Please fill in all fields.");
      setIsAuthProcessing(false);
      return;
    }

    if (authMode === 'register') {
      if (p !== confirmPassword) {
        setAuthError("Passwords do not match.");
        setIsAuthProcessing(false);
        return;
      }
      try {
        const userRef = doc(db, "usernames", lowerName);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setAuthError("This username is already taken.");
          setIsAuthProcessing(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, `${lowerName}@krater.app`, p);
        await setDoc(userRef, { uid: userCred.user.uid, originalName: cleanName });
        await updateProfile(userCred.user, { displayName: cleanName });

        setSavedAccounts(prev => {
          const filtered = prev.filter(acc => acc.username.toLowerCase() !== lowerName);
          return [{ username: cleanName, password: p }, ...filtered].slice(0, 3);
        });
        setIsAuthProcessing(false);
      } catch (err) {
        if (err.message.includes("permission-denied")) setAuthError("Database Locked.");
        else if (err.message.includes("auth/email-already-in-use")) setAuthError("Account already exists.");
        else setAuthError(`Registration Failed: ${err.message}`);
        setIsAuthProcessing(false);
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, `${lowerName}@krater.app`, p);
        setSavedAccounts(prev => {
          const filtered = prev.filter(acc => acc.username.toLowerCase() !== lowerName);
          return [{ username: cleanName, password: p }, ...filtered].slice(0, 3);
        });
        setIsAuthProcessing(false);
      } catch (err) {
        setAuthError("Invalid username or password.");
        setIsAuthProcessing(false);
      }
    }
  };

  const resizeImage = (base64Str, maxWidth = 800, maxHeight = 800) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width; let height = img.height;
        if (width > height) {
          if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
        } else {
          if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const processFile = async (file) => {

    if (!file) return;

    try {
      const gpsData = await exifr.gps(file);

      if (gpsData && gpsData.latitude && gpsData.longitude) {
        console.log("📍 EXIF Location Found:", gpsData.latitude, gpsData.longitude);


        updateLocationFromCoords(gpsData.longitude, gpsData.latitude);


        setTicketLocation(`${gpsData.latitude.toFixed(5)}, ${gpsData.longitude.toFixed(5)}`);
      } else {
        console.log("⚠️ No GPS data found. Triggering device GPS fallback...");
        fallbackToDeviceLocation();
        setTicketLocation(null);
      }
    } catch (error) {
      console.error("Error extracting EXIF data:", error);
      fallbackToDeviceLocation();
      setTicketLocation(null);
    }


    const allowedExtensions = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedExtensions.includes(file.type)) {
      showToast(t("Only PNG and JPEG files are allowed."));
      return;
    }
    if (previewImage) {
      showToast(t("Only 1 image can be attached at a time."));
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const resized = await resizeImage(e.target.result);
      setPreviewImage(resized);
    };
    reader.readAsDataURL(file);
    setIsDraggingOver(false);
  };

  const showToast = (message) => {
    setNotification({ visible: true, message });
    setTimeout(() => setNotification({ visible: false, message: '' }), 3000);
  };

  const handleSendMessage = () => {
    if (!inputText.trim() && !previewImage) return;


    if (previewImage && (!selectedDistrict || !specificLocation.trim())) {
      alert(t("Please provide both the District and the specific street/landmark!"));
      return;
    }

    const userText = inputText;
    const fileToSend = selectedFile;
    const imgPreview = previewImage;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      image: imgPreview
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    saveCurrentChatToHistory(newMsgs);
    setInputText('');
    setPreviewImage(null);
    setSelectedFile(null);

    if (!isOnline) {
      setPendingMessages(newMsgs);
      setNotification({ visible: true, message: t("Offline: Data saved locally. Auto-sync will start when online.") });
      setTimeout(() => setNotification({ visible: false, message: "" }), 3000);
      return;
    }

    setIsBotTyping(true);
    if (userMsg.image && fileToSend) {
      handleStartScan(newMsgs, fileToSend, ticketLocation);
    } else {
      handleChatReply(newMsgs, userText);
    }
  };




  const handleChatReply = async (msgs, userText) => {
    try {

      let dbContext = "No tickets currently open.";
      try {
        const ticketsRef = collection(db, "tickets");
        const q = query(ticketsRef, orderBy("createdAt", "desc"), limit(10));
        const snap = await getDocs(q);

        if (!snap.empty) {
          dbContext = "";
          snap.forEach(doc => {
            const t = doc.data();


            const aiEst = t.estimated_budget ? Math.round(Number(t.estimated_budget)) : 0;
            const finalBudget = t.budget ? Math.round(Number(t.budget)) : 'Pending';


            dbContext += `[Ticket ${t.ticketLabel} | Location: ${t.road} | Potholes: ${t.potholes} | Severity: ${t.severity} | Status: ${t.status} | Inspector: ${t.inspector || 'Unassigned'} | AI Est: ₹${aiEst} | Allocated Budget: ₹${finalBudget}]\n`;
          });
        }
      } catch (dbError) {
        console.error("Failed to fetch context for AI:", dbError);
      }
      dbContext += `\n\nCRITICAL INSTRUCTION: The user's interface is currently set to ${language}. You MUST reply to the user entirely in ${language}. Do not respond in English unless the requested language is English.`;
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, context: dbContext })
      });
      const data = await response.json();


      if (data.status === 'success') {
        setIsBotTyping(false);
        const botMsg = { id: Date.now(), sender: 'bot', text: data.reply };
        const finalMsgs = [...msgs, botMsg];
        setMessages(finalMsgs);
        saveCurrentChatToHistory(finalMsgs);
      } else {
        throw new Error(data.reply);
      }
    } catch (error) {
      console.error("Chat API Error:", error);
      setIsBotTyping(false);
      const botMsg = { id: Date.now(), sender: 'bot', text: t("Groq AI Core Offline: Ensure your Uvicorn server is running on port 8000!") };
      setMessages(prev => [...prev, botMsg]);
    }
  };




  const handleStartScan = async (msgsBeforeScan = null, file, loc = ticketLocation) => {
    const baseMessages = msgsBeforeScan || messages;
    setIsScanning(true);
    setIsBotTyping(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 15, 90));
    }, 400);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('location', selectedDistrict);

      const response = await fetch('http://127.0.0.1:8000/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Could not connect to Krater YOLO Backend");

      const aiData = await response.json();
      console.log("API Response:", aiData);


      if (aiData.pothole_count > 0 || aiData.status === "success") {
        setBudget(aiData.estimated_budget || 0);
        setMaterial(aiData.estimated_material_sqm || 0);
      }

      setTimeout(async () => {
        setIsScanning(false);
        setIsBotTyping(false);
        const currentMsgs = baseMessages;

        const livePotholes = aiData.pothole_count || 0;
        const liveSeverity = aiData.damage_severity || 'NONE';
        const processedImgBase64 = aiData.processed_image_base64 ? `data:image/jpeg;base64,${aiData.processed_image_base64}` : null;


        let finalImageUrl = null;
        if (processedImgBase64) {
          try {
            const uploadRes = await fetch('http://127.0.0.1:8000/upload-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image_base64: processedImgBase64 })
            });
            const uploadData = await uploadRes.json();
            if (uploadData.status === 'success') {
              finalImageUrl = uploadData.url;
            }
          } catch (storageError) {
            console.error("Error uploading via backend:", storageError);
          }
        }


        const newReport = {
          id: 'draft_' + Date.now(),
          potholes: livePotholes,
          severity: liveSeverity,
          road: `${specificLocation.trim()}, ${selectedDistrict}`,
          location: `${specificLocation.trim()}, ${selectedDistrict}`,
          ticket: 'Pending',
          image: null,
          processedImage: finalImageUrl,
          estimated_budget: aiData.estimated_budget || 0,
          estimated_material_sqm: aiData.estimated_material_sqm || 0,
          isReported: false
        };

        const botMsg = {
          id: Date.now(),
          sender: 'bot',
          text: livePotholes > 0
            ? `${t("Analysis complete! I found ")}${newReport.potholes}${t(" pothole(s) with ")}${t(newReport.severity)}${t(" severity.")}`
            : t("Analysis complete! I didn't find any potholes in this image. No report is needed, as the road looks clear."),
          reportData: newReport
        };

        const finalMsgs = [...currentMsgs, botMsg];
        setMessages(finalMsgs);
        saveCurrentChatToHistory(finalMsgs);
        setCurrentStep(newReport.id.toString());
      }, 600);
    }
    catch (error) {
      console.error("Vision API Error:", error);
      clearInterval(progressInterval);
      setIsScanning(false);
      setIsBotTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now(), sender: 'bot', text: t("Vision Core Offline: Check your Python YOLO server!")
      }]);
    }
  };

  const hasPromptInChat = (chatMessages) => chatMessages.some((msg) => msg.sender === 'user' && ((msg.text && msg.text.trim()) || msg.image));

  const buildChatTitle = (chatMessages) => {
    const firstUserMessage = chatMessages.find((msg) => msg.sender === 'user');
    if (!firstUserMessage) return 'Untitled Chat';
    if (firstUserMessage.text && firstUserMessage.text.trim()) return firstUserMessage.text.trim().slice(0, 34);
    return 'Image Report Chat';
  };

  const handleReportSubmit = async (msgId, reportData) => {
    setIsBotTyping(true);
    let nextTicketNumber = null;
    try {
      const counterRef = doc(db, "metadata", "ticketCounter");
      nextTicketNumber = await runTransaction(db, async (transaction) => {
        const counterSnap = await transaction.get(counterRef);
        const currentNumber = counterSnap.exists() ? (counterSnap.data().lastTicketNumber || 0) : 0;
        const nextNumber = currentNumber + 1;
        transaction.set(counterRef, { lastTicketNumber: nextNumber }, { merge: true });
        return nextNumber;
      });
    } catch (error) {
      console.error("Ticket counter transaction failed:", error);
      nextTicketNumber = Date.now();
    }

    try {
      await addDoc(collection(db, "tickets"), {
        ticketNumber: nextTicketNumber,
        ticketLabel: `#${nextTicketNumber}`,
        potholes: reportData.potholes,
        severity: reportData.severity,
        road: reportData.road,
        location: reportData.location,
        image: reportData.processedImage || reportData.image,
        createdByUid: user?.uid || null,
        createdAt: serverTimestamp(),
        status: "open",
        isConfirmed: null,
        adminConfirmed: null,
        inspectorConfirmed: null,
        isConfirmed: null,
        estimated_budget: reportData.estimated_budget || 0,
        estimated_material_sqm: reportData.estimated_material_sqm || 0
      });
    } catch (error) { console.error("Ticket write failed:", error); }

    const updatedMsgs = messages.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          reportData: {
            ...m.reportData,
            isReported: true,
            ticket: `#${nextTicketNumber}`
          }
        };
      }
      return m;
    });

    setMessages(updatedMsgs);

    setTimeout(() => {
      setIsBotTyping(false);
      const newBotMsg = {
        id: Date.now(),
        sender: 'bot',
        text: `The ticket #${nextTicketNumber} has been assigned to your report.`
      };
      const finalMsgs = [...updatedMsgs, newBotMsg];
      setMessages(finalMsgs);
      saveCurrentChatToHistory(finalMsgs);
    }, 600);
  };




  const saveCurrentChatToHistory = async (messagesToSave = null) => {
    const msgs = messagesToSave || messages;
    if (!hasPromptInChat(msgs) || !user) return;

    try {
      let chatId = activeChatIdRef.current;


      if (!chatId) {
        const chatData = {
          userId: user.uid,
          title: buildChatTitle(msgs),
          updatedAt: Date.now(),
          lastMessage: msgs[msgs.length - 1].text || 'Image'
        };
        const docRef = await addDoc(collection(db, "chats"), chatData);
        chatId = docRef.id;
        activeChatIdRef.current = chatId;
        setActiveChatId(chatId);
      } else {
        await setDoc(doc(db, "chats", chatId), {
          updatedAt: Date.now(),
          lastMessage: msgs[msgs.length - 1].text || 'Image'
        }, { merge: true });
      }




      const latestMsg = msgs[msgs.length - 1];

      const messageToSave = { ...latestMsg };



      if (messageToSave.sender === 'user') {
        delete messageToSave.image;
      }
      await addDoc(collection(db, "chats", chatId, "messages"), {
        ...messageToSave,
        timestamp: serverTimestamp()
      });

    } catch (error) { console.error("Error saving chat:", error); }
  };

  const handleLoadChatFromHistory = async (chatItem) => {
    try {
      const messagesRef = collection(db, "chats", chatItem.id, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));
      const snapshot = await getDocs(q);
      const loadedMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setMessages(loadedMsgs);
      setActiveChatId(chatItem.id);
      activeChatIdRef.current = chatItem.id;
      setCurrentStep('upload');
      setIsScanning(false);
      setProgress(0);
      setPreviewImage(null);
      setSelectedFile(null);
      setInputText('');
      setShowHistory(false);
    } catch (error) {
      console.error("Error loading chat history:", error);
      showToast(t("Failed to load chat history."));
    }
  };

  const requestDeleteChatHistory = (chatId, e) => {
    e.stopPropagation();
    setDeleteTargetChatId(chatId);
    setShowDeleteChatModal(true);
  };

  const confirmDeleteChatHistory = async () => {
    if (!deleteTargetChatId || !user) return;
    try {
      await deleteDoc(doc(db, "chats", deleteTargetChatId));
      if (activeChatId === deleteTargetChatId) {
        setMessages([]);
        setActiveChatId(null);
        activeChatIdRef.current = null;
        setCurrentStep('upload');
        setIsScanning(false);
        setProgress(0);
        setPreviewImage(null);
        setSelectedFile(null);
        setInputText('');
      }
    } catch (error) { console.error("Error deleting chat:", error); }
    setDeleteTargetChatId(null);
    setShowDeleteChatModal(false);
  };

  const closeDeleteChatModal = () => {
    setDeleteTargetChatId(null);
    setShowDeleteChatModal(false);
  };

  const handleResetCounter = async () => {
    try {
      const counterRef = doc(db, "metadata", "ticketCounter");
      await setDoc(counterRef, { lastTicketNumber: 0 }, { merge: true });
      alert(t("Ticket counter has been reset to 0."));
    } catch (error) {
      console.error("Failed to reset counter:", error);
      alert(t("Failed to reset counter."));
    }
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setPreviewImage(null);
    setSelectedFile(null);
    setProgress(0);
    setIsScanning(false);
    setMessages([]);
    setInputText('');
    setActiveChatId(null);
    activeChatIdRef.current = null;
    setTicketLocation(null);
  };

  const handleSignOut = async () => {
    if (user && user.displayName) {
      setSavedAccounts(prev => prev.filter(acc => acc.username.toLowerCase() !== user.displayName.toLowerCase()));
    }
    await signOut(auth);
    setShowUserMenu(false);
    setShowHistory(false);
    handleReset();
  };

  const handleSwitchAccount = async () => {
    await signOut(auth);
    setAuthMode('signin');
    setShowUserMenu(false);
    setShowHistory(false);
    handleReset();
  };

  const handleAddAccount = async () => {
    await signOut(auth);
    setAuthMode('signin');
    setShowUserMenu(false);
    setShowHistory(false);
    handleReset();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL 🚨': return '#ef5350';
      case 'HIGH': return '#ef5350';
      case 'MODERATE': return '#fbc02d';
      case 'LOW': return '#42a5f5';
      case 'NONE': return '#66bb6a';
      default: return isDarkMode ? '#eee' : '#333';
    }
  };


  const colors = {
    bg: isDarkMode ? '#111827' : '#f1f5f9',
    panel: isDarkMode ? '#1f2937' : '#ffffff',
    header: '#0D9488',
    border: isDarkMode ? '#374151' : '#cbd5e1',
    text: isDarkMode ? '#f9fafb' : '#1e293b',
    subtext: isDarkMode ? '#94a3b8' : '#64748B',
    logo: '#fff',
    accent: '#0D9488',
    secondaryAccent: '#64748B',
    tertiaryAccent: '#C36D4B',
    headerIconColor: '#fff',
    botBubble: isDarkMode ? '#374151' : '#e2e8f0'
  };

  const pageWrapperStyle = {
    height: isMobile ? '100dvh' : '100vh', width: '100vw', display: 'flex', flexDirection: 'column',
    fontFamily: fontPrimary, overflow: 'hidden',
    backgroundColor: colors.bg, color: colors.text, transition: 'all 0.3s ease',
    fontSize: language === 'Bengali' ? '1.4rem' : '1rem'
  };

  const headerStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: isMobile ? '0 15px' : '0 40px', height: '80px', backgroundColor: colors.header,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)', flexShrink: 0, position: 'relative',
    transition: 'background-color 0.3s ease', fontFamily: fontPrimary, zIndex: 1001
  };

  const mainAreaStyle = {
    flex: 1, display: 'flex', flexDirection: 'column', position: 'relative',
    overflow: 'hidden', boxSizing: 'border-box'
  };

  const popoverStyle = {
    position: 'absolute', top: '75px', right: '0px', width: '320px', maxHeight: '450px',
    backgroundColor: colors.panel, borderRadius: '12px', border: `1px solid ${colors.border}`,
    boxShadow: isDarkMode ? '0 10px 25px rgba(0, 0, 0, 0.4)' : '0 10px 25px rgba(0, 0, 0, 0.15)',
    zIndex: 1000, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    fontFamily: fontPrimary
  };

  const inputStyle = {
    width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #000',
    backgroundColor: 'transparent', color: colors.text, fontSize: '1rem', outline: 'none',
    boxSizing: 'border-box', fontFamily: fontPrimary
  };

  const isChatEmpty = messages.length === 0 && !isScanning;
  const composerBottomReserve = previewImage ? 520 : 440;
  const composerOccluderHeight = previewImage ? 135 : 105;
  const inputWrapperStyle = {
    position: 'absolute', left: '50%', transform: 'translateX(-50%)',
    bottom: isChatEmpty ? '50%' : (isMobile ? '55px' : '30px'), marginBottom: isChatEmpty ? (isMobile ? '-40px' : '-30px') : '0',
    width: isMobile ? '94%' : '90%', maxWidth: '800px', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 30, display: 'flex', flexDirection: 'column'
  };

  if (authLoading) return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', fontFamily: '"Century Gothic", sans-serif' }}>Loading KRATER...</div>;


  if (showLanding) {
    return <LandingPage
      onGetStarted={() => setShowLanding(false)}
      user={user}
      userRole={userRole}
      onSignOut={handleSignOut}
      onAddAccount={handleAddAccount}
      onSwitchAccount={handleSwitchAccount}
      onGoDashboard={() => setShowLanding(false)}
    />;
  }


  if (!user) {
    const authInputStyle = { ...inputStyle, color: '#333', borderRadius: '8px', backgroundColor: '#f0fdfa', fontFamily: fontPrimary };
    const [showAuthLangMenu, setShowAuthLangMenu] = [showLanguageMenu, setShowLanguageMenu];
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw',
        backgroundImage: 'url("/authScreenBG.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', fontFamily: fontPrimary, position: 'relative'
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', width: isMobile ? '85%' : '380px',
          maxWidth: '400px', backgroundColor: '#f0fdfa', padding: isMobile ? '25px 20px' : '40px',
          borderRadius: isMobile ? '30px' : '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          animation: 'fadeInUp 0.6s ease-out', boxSizing: 'border-box', position: 'relative'
        }}>
          <img src="/logo.png" alt="Krater Splash Logo" style={{ width: isMobile ? '110px' : '140px', height: 'auto', marginBottom: '5px', mixBlendMode: 'multiply' }} />
          <h1 style={{ marginTop: 0, color: '#000', fontFamily: fontLogo, letterSpacing: '3px', marginBottom: '15px', fontSize: isMobile ? '2.2rem' : '2.8rem' }}>KRATER</h1>
          <div style={{ width: '100%', height: '1px', backgroundColor: '#cbd5e1', marginBottom: isMobile ? '20px' : '30px' }} />
          {authError && <div style={{ color: '#ef5350', fontSize: '0.85rem', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold', lineHeight: '1.2' }}>{authError}</div>}

          {authMode === 'signin' && savedAccounts.length > 0 && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
              {savedAccounts.map(acc => (
                <div key={acc.username} onClick={() => { setUsername(acc.username); setPassword(acc.password); handleAuthAction(acc.username, acc.password); }}
                  onMouseEnter={() => setHoveredSavedAccount(acc.username)} onMouseLeave={() => setHoveredSavedAccount(null)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 15px', border: '1px solid #000', borderRadius: '30px', cursor: 'pointer', boxSizing: 'border-box', backgroundColor: hoveredSavedAccount === acc.username ? '#99f6e4' : '#f0fdfa', transition: 'background-color 0.2s ease' }}
                >
                  <span style={{ fontFamily: '"Century Gothic", sans-serif', color: '#333', fontSize: '1rem', fontWeight: 'bold' }}>{acc.username}</span>
                  <span onClick={(e) => { e.stopPropagation(); setSavedAccounts(prev => prev.filter(a => a.username !== acc.username)); if (username === acc.username) { setUsername(''); setPassword(''); } }}
                    onMouseEnter={(e) => { e.stopPropagation(); setHoveredDeleteSavedAccount(acc.username); }} onMouseLeave={(e) => { e.stopPropagation(); setHoveredDeleteSavedAccount(null); }}
                    style={{ color: hoveredDeleteSavedAccount === acc.username ? '#ef5350' : '#333', fontSize: '1.2rem', lineHeight: 1, cursor: 'pointer', fontWeight: 'bold', backgroundColor: hoveredDeleteSavedAccount === acc.username ? 'rgba(239, 83, 80, 0.14)' : 'transparent', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s ease' }}
                  >×</span>
                </div>
              ))}
            </div>
          )}

          <input type="text" placeholder={t('Username')} value={username} autoComplete="off" onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); passwordInputRef.current?.focus(); } }} style={authInputStyle} />
          <input ref={passwordInputRef} type="password" placeholder={t('Password')} value={password} autoComplete="new-password" onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (authMode === 'register') confirmPasswordInputRef.current?.focus(); else handleAuthAction(); } }} style={{ ...authInputStyle, marginBottom: authMode === 'register' ? '15px' : '25px' }} />

          {authMode === 'register' && (
            <input ref={confirmPasswordInputRef} type="password" placeholder={t('Confirm Password')} value={confirmPassword} autoComplete="new-password" onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAuthAction(); } }} style={{ ...authInputStyle, marginBottom: '25px' }} />
          )}

          <button onClick={() => handleAuthAction()} disabled={isAuthProcessing} style={{ padding: '10px 30px', backgroundColor: isAuthProcessing ? '#94a3b8' : colors.accent, color: '#fff', border: 'none', fontSize: '1rem', borderRadius: '30px', cursor: isAuthProcessing ? 'default' : 'pointer', marginBottom: '20px', fontFamily: fontPrimary, minWidth: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '42px', transition: 'background-color 0.2s' }}>
            {isAuthProcessing ? <svg viewBox="0 0 50 50" style={{ width: '24px', height: '24px', animation: 'spin 1s linear infinite' }}><circle cx="25" cy="25" r="20" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="90, 150" strokeLinecap="round" /></svg> : t(authMode === 'signin' ? 'Sign-In' : 'Register')}
          </button>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <div style={{ position: 'relative' }}>
              <div onClick={() => setShowAuthLangMenu(!showAuthLangMenu)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <span style={{ fontSize: '0.9rem', color: '#333', fontFamily: fontPrimary, fontWeight: 'bold' }}>{languageLabels[language]}</span>
              </div>
              {showAuthLangMenu && (
                <div style={{ position: 'absolute', bottom: '30px', left: 0, width: '180px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', overflow: 'hidden', animation: 'fadeInUp 0.2s ease', zIndex: 200 }}>
                  <div style={{ overflowY: 'auto', maxHeight: '340px' }}>
                    <div onClick={() => { setLanguage('English'); setShowAuthLangMenu(false); }} style={{ padding: '10px 14px', cursor: 'pointer', backgroundColor: language === 'English' ? '#eef6fc' : 'transparent', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background-color 0.2s' }}>
                      <span style={{ fontSize: '0.9rem', color: '#333', fontWeight: language === 'English' ? 'bold' : 'normal', fontFamily: '"Century Gothic", sans-serif' }}>English</span>
                      {language === 'English' && <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                    <div onClick={() => { setLanguage('Hindi'); setShowAuthLangMenu(false); }} style={{ padding: '10px 14px', cursor: 'pointer', backgroundColor: language === 'Hindi' ? '#eef6fc' : 'transparent', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background-color 0.2s' }}>
                      <span style={{ fontSize: '0.9rem', color: '#333', fontWeight: language === 'Hindi' ? 'bold' : 'normal', fontFamily: '"Poppins", sans-serif' }}>हिन्दी</span>
                      {language === 'Hindi' && <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                    <div onClick={() => { setLanguage('Bengali'); setShowAuthLangMenu(false); }} style={{ padding: '10px 14px', cursor: 'pointer', backgroundColor: language === 'Bengali' ? '#eef6fc' : 'transparent', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background-color 0.2s' }}>
                      <span style={{ fontSize: '0.9rem', color: '#333', fontWeight: language === 'Bengali' ? 'bold' : 'normal', fontFamily: '"Hind Siliguri", sans-serif' }}>বাংলা</span>
                      {language === 'Bengali' && <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                    <div onClick={() => { setLanguage('Nepali'); setShowAuthLangMenu(false); }} style={{ padding: '10px 14px', cursor: 'pointer', backgroundColor: language === 'Nepali' ? '#eef6fc' : 'transparent', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background-color 0.2s' }}>
                      <span style={{ fontSize: '0.9rem', color: '#333', fontWeight: language === 'Nepali' ? 'bold' : 'normal', fontFamily: '"Poppins", sans-serif' }}>नेपाली</span>
                      {language === 'Nepali' && <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                    <div onClick={() => { setLanguage('Sinhala'); setShowAuthLangMenu(false); }} style={{ padding: '10px 14px', cursor: 'pointer', backgroundColor: language === 'Sinhala' ? '#eef6fc' : 'transparent', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background-color 0.2s' }}>
                      <span style={{ fontSize: '0.9rem', color: '#333', fontWeight: language === 'Sinhala' ? 'bold' : 'normal', fontFamily: '"Hind Madurai", sans-serif' }}>සිංහල</span>
                      {language === 'Sinhala' && <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                    <div onClick={() => { setLanguage('Dzongkha'); setShowAuthLangMenu(false); }} style={{ padding: '10px 14px', cursor: 'pointer', backgroundColor: language === 'Dzongkha' ? '#eef6fc' : 'transparent', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background-color 0.2s' }}>
                      <span style={{ fontSize: '0.9rem', color: '#333', fontWeight: language === 'Dzongkha' ? 'bold' : 'normal', fontFamily: '"Noto Serif Tibetan", serif' }}>རྫོང་ཁ</span>
                      {language === 'Dzongkha' && <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                    <div onClick={() => { setLanguage('Myanmar'); setShowAuthLangMenu(false); }} style={{ padding: '10px 14px', cursor: 'pointer', backgroundColor: language === 'Myanmar' ? '#eef6fc' : 'transparent', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background-color 0.2s' }}>
                      <span style={{ fontSize: '0.9rem', color: '#333', fontWeight: language === 'Myanmar' ? 'bold' : 'normal', fontFamily: '"Noto Sans Myanmar", sans-serif' }}>မြန်မာ</span>
                      {language === 'Myanmar' && <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                    <div onClick={() => { setLanguage('Thai'); setShowAuthLangMenu(false); }} style={{ padding: '10px 14px', cursor: 'pointer', backgroundColor: language === 'Thai' ? '#eef6fc' : 'transparent', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background-color 0.2s' }}>
                      <span style={{ fontSize: '0.9rem', color: '#333', fontWeight: language === 'Thai' ? 'bold' : 'normal', fontFamily: '"Prompt", sans-serif' }}>ไทย</span>
                      {language === 'Thai' && <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <span onClick={() => { setAuthMode(authMode === 'signin' ? 'register' : 'signin'); setAuthError(''); setUsername(''); setPassword(''); setConfirmPassword(''); }} style={{ fontSize: '0.9rem', color: '#333', cursor: 'pointer', fontFamily: fontPrimary }}>
              {t(authMode === 'signin' ? 'New User?' : 'Already a User?')}
            </span>
          </div>
        </div>
      </div>
    );
  }



  if (userRole === 'inspector') {
    return <InspectorDashboard user={user} db={db} onSignOut={handleSignOut} onAddAccount={handleAddAccount} onSwitchAccount={handleSwitchAccount} onGoHome={() => setShowLanding(true)} />;
  }

  const renderAdminDashboard = () => {
    let showActionButtons = false;
    let isTicketLocked = true;

    if (selectedTicket) {
      const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
      if (selectedTicket.isConfirmed === null || selectedTicket.isConfirmed === undefined) {
        showActionButtons = true;
        isTicketLocked = true;
      } else if (selectedTicket.isConfirmed === true) {
        isTicketLocked = false;
        const confirmedTime = selectedTicket.confirmedAt ? (selectedTicket.confirmedAt.toMillis ? selectedTicket.confirmedAt.toMillis() : selectedTicket.confirmedAt.seconds * 1000) : 0;
        if (selectedTicket.confirmedAt && Date.now() - confirmedTime < twoWeeksMs) {
          showActionButtons = true;
        } else {
          showActionButtons = false;
        }
      } else if (selectedTicket.isConfirmed === false) {
        isTicketLocked = true;
        showActionButtons = true;
      }
    }

    return (
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: isMobile ? 'column' : 'row', position: 'relative' }}>
        { }
        <div style={{ width: isMobile ? '100%' : '40%', height: '100%', borderRight: isMobile ? 'none' : `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', backgroundColor: colors.panel }}>
          <div style={{ padding: '20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontFamily: fontSecondary, fontSize: '1.2rem', color: colors.text }}>{t('REPORTS LOG')}</h2>
            <div style={{ fontSize: '0.8rem', color: colors.subtext, fontWeight: 'bold' }}>{adminTickets.length} {t('TICKETS')}</div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, padding: '10px' }}>
            {adminTickets.length === 0 ? <div style={{ padding: '20px', textAlign: 'center', color: colors.subtext }}>{t('No reports generated yet.')}</div> : null}
            {adminTickets.map(ticket => (
              <div key={ticket.id} onClick={() => handleTicketSelect(ticket)} style={{ padding: '15px', marginBottom: '10px', backgroundColor: selectedTicket?.id === ticket.id ? (isDarkMode ? '#334155' : '#e0f2fe') : (isDarkMode ? '#1e293b' : '#f8fafc'), borderRadius: '10px', cursor: 'pointer', border: `1px solid ${selectedTicket?.id === ticket.id ? colors.accent : colors.border}`, transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.05rem', color: colors.text, fontFamily: '"Century Gothic", sans-serif' }}>{ticket.ticketLabel}</span>
                  <span style={{ fontWeight: 'bold', color: getSeverityColor(ticket.severity), fontSize: '0.9rem', fontFamily: '"Century Gothic", sans-serif' }}>{ticket.severity}</span>
                </div>
                <div style={{ color: colors.subtext, fontSize: '0.85rem', marginBottom: '5px', fontFamily: '"Century Gothic", sans-serif' }}>{ticket.road}</div>
                <div style={{ color: colors.subtext, fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span>{t('Reported:')} {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleDateString() : t('Just now')}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      padding: '2px 6px',
                      backgroundColor: ticket.status === 'resolved' ? 'rgba(102, 187, 106, 0.2)' : (ticket.status === 'declined' ? 'rgba(239, 83, 80, 0.2)' : 'rgba(13, 148, 136, 0.15)'),
                      color: ticket.status === 'resolved' ? '#66bb6a' : (ticket.status === 'declined' ? '#ef5350' : colors.accent),
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {ticket.status ? t(ticket.status.toUpperCase()) : t('OPEN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        { }
        <div
          style={{
            width: isMobile ? '100%' : '60%',
            height: '100%',
            padding: isMobile ? '20px' : '30px',
            overflowY: 'auto',
            backgroundColor: isMobile ? colors.panel : colors.bg,
            boxSizing: 'border-box',
            position: isMobile ? 'absolute' : 'relative',
            top: 0,
            left: 0,
            zIndex: isMobile ? 100 : 1,
            transform: isMobile ? (selectedTicket ? 'translateX(0)' : 'translateX(-100%)') : 'none',
            transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
            pointerEvents: (isMobile && !selectedTicket) ? 'none' : 'auto'
          }}
        >
          {!selectedTicket ? (
            <div style={{ display: isMobile ? 'none' : 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: colors.subtext, fontSize: '1.1rem', textAlign: 'center', padding: '0 40px' }}>
              {t("Select a report from the log to view details & allocate resources.")}
            </div>
          ) : (
            <div style={{ animation: isMobile ? 'none' : 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: colors.panel, padding: isMobile ? '10px' : '30px', borderRadius: '15px', border: isMobile ? 'none' : `1px solid ${colors.border}`, boxShadow: isMobile ? 'none' : '0 10px 30px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '20px' }}>
                {isMobile && (
                  <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', color: colors.text, fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: isDarkMode ? '#334155' : '#f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flexShrink: 0 }}>
                    ✕
                  </button>
                )}
                <h2 style={{ margin: '0', fontFamily: '"Century Gothic", sans-serif', fontSize: '1.5rem', color: colors.text, paddingTop: isMobile ? '5px' : '0' }}>{selectedTicket.ticketLabel}</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px' }}>
                {selectedTicket.image && (
                  <div style={{ flex: 1 }}>
                    <img src={selectedTicket.image} alt="Reported Image" style={{ width: '100%', borderRadius: '10px', border: `1px solid ${colors.border}`, objectFit: 'contain', maxHeight: '300px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }} />
                  </div>
                )}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div><div style={{ fontSize: '0.85rem', color: colors.subtext }}>{t('Location:')}</div><div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: colors.text, fontFamily: '"Century Gothic", sans-serif' }}>{selectedTicket.road}</div></div>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}><div style={{ fontSize: '0.85rem', color: colors.subtext }}>{t('Potholes Detected')}</div><div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.text, fontFamily: '"Century Gothic", sans-serif' }}>{selectedTicket.potholes}</div></div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: '0.85rem', color: colors.subtext }}>{t('Severity')}</div><div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: getSeverityColor(selectedTicket.severity), fontFamily: '"Century Gothic", sans-serif' }}>{selectedTicket.severity}</div></div>
                  </div>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1, position: 'relative', pointerEvents: isTicketLocked ? 'none' : 'auto', opacity: isTicketLocked ? 0.6 : 1 }} ref={statusDropdownRef}>
                      <div style={{ fontSize: '0.85rem', color: colors.subtext }}>{t('Status')}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: colors.accent }}>{selectedTicket.status ? t(selectedTicket.status.toUpperCase()) : t('OPEN')}</div>
                        <button
                          onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                          style={{ background: 'none', border: `1px solid ${colors.accent}`, color: colors.accent, borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold', fontFamily: fontPrimary, transition: 'all 0.2s' }}
                          onMouseEnter={(e) => { e.target.style.backgroundColor = colors.accent; e.target.style.color = '#fff'; }}
                          onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = colors.accent; }}
                        >
                          {t('Change?')}
                        </button>
                      </div>
                      {showStatusDropdown && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', backgroundColor: colors.panel, border: `1px solid ${colors.border}`, borderRadius: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', zIndex: 1001, width: '180px', overflow: 'hidden', animation: 'fadeInUp 0.2s ease' }}>
                          {['open', 'budget allocated', 'in progress', 'resolved', 'declined'].map((s, idx, arr) => (
                            <div
                              key={s}
                              onClick={() => { setNewStatusTarget(s); setShowStatusConfirmModal(true); setShowStatusDropdown(false); }}
                              style={{ padding: '12px 16px', fontSize: '0.85rem', cursor: 'pointer', color: colors.text, transition: 'background 0.2s', borderBottom: idx === arr.length - 1 ? 'none' : `1px solid ${colors.border}`, fontWeight: 'bold', fontFamily: fontPrimary }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = isDarkMode ? '#334155' : '#f1f5f9'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                              {t(s.toUpperCase())}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, position: 'relative' }} ref={inspectorDropdownRef}>
                      <div style={{ fontSize: '0.85rem', color: colors.subtext }}>{t('Road Inspector')}</div>
                      <div
                        onClick={() => setShowInspectorDropdown(!showInspectorDropdown)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          fontSize: '1.05rem',
                          fontWeight: 'bold',
                          color: colors.text,
                          fontFamily: '"Century Gothic", sans-serif',
                          userSelect: 'none',
                          transition: 'opacity 0.2s',
                          marginTop: '2px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        <span>{selectedTicket.inspector || selectedInspector}</span>
                        <span style={{ fontSize: '0.65rem', color: colors.subtext, transition: 'transform 0.2s', transform: showInspectorDropdown ? 'rotate(180deg)' : 'none' }}>▼</span>
                      </div>
                      {showInspectorDropdown && (
                        <div className="custom-scrollbar" style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          marginTop: '8px',
                          backgroundColor: colors.panel,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '10px',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                          zIndex: 1001,
                          width: '220px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          animation: 'fadeInUp 0.2s ease'
                        }}>
                          {inspectors.map((name) => (
                            <div
                              key={name}
                              onClick={async () => {
                                setSelectedInspector(name);
                                setShowInspectorDropdown(false);
                                if (selectedTicket) {
                                  try {
                                    await setDoc(doc(db, "tickets", selectedTicket.id), {
                                      inspector: name
                                    }, { merge: true });
                                    setSelectedTicket(prev => ({ ...prev, inspector: name }));
                                  } catch (error) {
                                    console.error("Error updating inspector:", error);
                                  }
                                }
                              }}
                              style={{
                                padding: '10px 16px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                color: colors.text,
                                transition: 'background 0.2s',
                                backgroundColor: (selectedTicket.inspector || selectedInspector) === name ? (isDarkMode ? '#334155' : '#e0f2fe') : 'transparent',
                                fontWeight: (selectedTicket.inspector || selectedInspector) === name ? 'bold' : 'normal',
                                fontFamily: fontPrimary
                              }}
                              onMouseEnter={(e) => {
                                if ((selectedTicket.inspector || selectedInspector) !== name) {
                                  e.target.style.backgroundColor = isDarkMode ? '#1e293b' : '#f1f5f9';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if ((selectedTicket.inspector || selectedInspector) !== name) {
                                  e.target.style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              {name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {showActionButtons && (
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px', marginBottom: '10px' }}>
                  <button
                    onClick={() => setActionModal({ visible: true, type: 'decline' })}
                    style={{ flex: 1, padding: '14px', backgroundColor: 'transparent', color: '#ef5350', border: '2px solid #ef5350', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', fontFamily: fontPrimary, transition: 'background-color 0.2s' }}
                  >
                    {t('Decline')}
                  </button>
                  {selectedTicket.isConfirmed !== true && (
                    <button
                      onClick={() => setActionModal({ visible: true, type: 'confirm' })}
                      style={{ flex: 1, padding: '14px', backgroundColor: '#66bb6a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', fontFamily: fontPrimary, boxShadow: '0 4px 10px rgba(102, 187, 106, 0.3)', transition: 'background-color 0.2s' }}
                    >
                      {t('Confirm Ticket')}
                    </button>
                  )}
                </div>
              )}

              <hr style={{ border: 'none', borderTop: `1px dashed ${colors.border}`, margin: '5px 0' }} />

              <div style={{ pointerEvents: isTicketLocked ? 'none' : 'auto', opacity: isTicketLocked ? 0.6 : 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: 0, color: colors.text, fontSize: '1.1rem', fontWeight: 'bold' }}>{t('Operations & Resource Allocation')}</h3>
                { }
                <div style={{ display: 'flex', gap: '20px', marginTop: '15px', marginBottom: '20px', padding: '15px', backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc', borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', color: colors.subtext }}>{t('AI Estimated Budget (INR)')}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.accent, fontFamily: '"Century Gothic", sans-serif' }}>
                      ₹ {selectedTicket.estimated_budget ? Number(selectedTicket.estimated_budget).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', color: colors.subtext }}>{t('Material Required (Asphalt)')}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.accent, fontFamily: '"Century Gothic", sans-serif' }}>
                      {selectedTicket.estimated_material_sqm ? selectedTicket.estimated_material_sqm : '0'} sq meters
                    </div>
                  </div>
                </div>
                { }
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ fontSize: '0.9rem', color: colors.text, fontWeight: 'bold' }}>{t('Budget Allocation (INR)')}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: isDarkMode ? 'rgba(13, 148, 136, 0.1)' : 'rgba(13, 148, 136, 0.05)', padding: '4px 12px', borderRadius: '8px', border: `1px solid ${isDarkMode ? 'rgba(13, 148, 136, 0.3)' : 'rgba(13, 148, 136, 0.1)'}` }}>
                      <span style={{ fontWeight: 'bold', color: colors.accent, fontSize: '1.1rem' }}>
                        {language === 'Nepali' ? 'रु' : (language === 'Bengali' ? '৳' : (language === 'Sinhala' ? 'රු' : (language === 'Dzongkha' ? 'Nu.' : (language === 'Myanmar' ? 'K' : (language === 'Thai' ? '฿' : '₹')))))}
                      </span>
                      <input
                        type="number"
                        value={Math.round(budgetAllocation * (language === 'Nepali' ? 1.60 : (language === 'Bengali' ? 1.42 : (language === 'Sinhala' ? 3.50 : (language === 'Dzongkha' ? 1.0 : (language === 'Myanmar' ? 25.0 : (language === 'Thai' ? 0.43 : 1)))))))}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const rate = language === 'Nepali' ? 1.60 : (language === 'Bengali' ? 1.42 : (language === 'Sinhala' ? 3.50 : (language === 'Dzongkha' ? 1.0 : (language === 'Myanmar' ? 25.0 : (language === 'Thai' ? 0.43 : 1)))));
                          setBudgetAllocation(Math.round(val / rate));
                        }}
                        style={{
                          fontWeight: 'bold',
                          color: colors.accent,
                          fontSize: '1.1rem',
                          border: 'none',
                          background: 'transparent',
                          width: '140px',
                          textAlign: 'right',
                          outline: 'none',
                          fontFamily: '"Century Gothic", sans-serif',
                          WebkitAppearance: 'none',
                          margin: 0
                        }}
                      />
                    </div>
                  </div>
                  <input type="range" min="0" max="10000000" step="50000" value={budgetAllocation} onChange={(e) => setBudgetAllocation(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: colors.accent }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: colors.subtext, marginTop: '8px', fontWeight: 'bold', fontFamily: '"Century Gothic", sans-serif' }}>
                    <span>
                      {language === 'Nepali' ? 'रु 0' : (language === 'Bengali' ? '৳ 0' : (language === 'Sinhala' ? 'රු 0' : (language === 'Dzongkha' ? 'Nu. 0' : (language === 'Myanmar' ? 'K 0' : (language === 'Thai' ? '฿ 0' : '₹ 0')))))}
                    </span>
                    <span>
                      {language === 'Nepali' ? 'रु 1,60,00,000' : (language === 'Bengali' ? '৳ 1,42,00,000' : (language === 'Sinhala' ? 'රු 3,50,00,000' : (language === 'Dzongkha' ? 'Nu. 1,00,00,000' : (language === 'Myanmar' ? 'K 25,00,00,000' : (language === 'Thai' ? '฿ 43,00,000' : '₹ 1,00,00,000')))))}
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: colors.text, fontWeight: 'bold', marginBottom: '8px' }}>{t('Repair Deadline')}</label>
                  <div style={{ position: 'relative' }} ref={calendarRef}>
                    <div
                      onClick={() => setShowCalendar(!showCalendar)}
                      style={{
                        padding: '14px 18px', borderRadius: '10px', border: `1px solid ${colors.border}`,
                        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', color: manualDeadline ? colors.text : colors.subtext,
                        fontFamily: fontPrimary, width: '100%', boxSizing: 'border-box',
                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                      }}
                    >
                      <span>{manualDeadline ? new Date(manualDeadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : t('Select a date...')}</span>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    {showCalendar && renderCustomCalendar()}
                  </div>
                </div>

                <button onClick={saveAdminChanges} style={{ padding: '14px', backgroundColor: colors.accent, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', fontFamily: fontPrimary, marginTop: '10px', transition: 'background-color 0.2s', boxShadow: '0 4px 10px rgba(13, 148, 136, 0.3)' }}>
                  {t('Save Allocations & Deadline')}
                </button>
              </div>

            </div>
          )}

          {showStatusConfirmModal && (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ width: 'calc(100% - 40px)', maxWidth: '400px', backgroundColor: colors.panel, padding: '30px', borderRadius: '15px', border: `1px solid ${colors.border}`, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center', animation: 'fadeInUp 0.3s ease' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.text, marginBottom: '15px', fontFamily: fontSecondary }}>Confirm {t('Status')}</div>
                <div style={{ color: colors.subtext, marginBottom: '25px', fontFamily: fontPrimary, lineHeight: '1.5' }}>Are you sure you want to change the status to <b style={{ color: colors.accent }}>{t(newStatusTarget.toUpperCase())}</b>?</div>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button onClick={() => setShowStatusConfirmModal(false)} style={{ padding: '12px 25px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: 'transparent', color: colors.text, cursor: 'pointer', fontWeight: 'bold', fontFamily: fontPrimary, minWidth: '100px' }}>{t('Cancel')}</button>
                  <button onClick={handleStatusChange} style={{ padding: '12px 25px', borderRadius: '8px', border: 'none', backgroundColor: colors.accent, color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontFamily: fontPrimary, minWidth: '100px' }}>Confirm</button>
                </div>
              </div>
            </div>
          )}

          {actionModal.visible && (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ width: 'calc(100% - 40px)', maxWidth: '400px', backgroundColor: colors.panel, padding: '30px', borderRadius: '15px', border: `1px solid ${colors.border}`, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center', animation: 'fadeInUp 0.3s ease' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.text, marginBottom: '15px', fontFamily: fontSecondary }}>
                  {actionModal.type === 'confirm' ? t('Confirm Ticket') : t('Decline Ticket')}
                </div>
                <div style={{ color: colors.subtext, marginBottom: '25px', fontFamily: fontPrimary, lineHeight: '1.5' }}>
                  Are you sure you want to {actionModal.type === 'confirm' ? <b style={{ color: '#66bb6a' }}>confirm</b> : <b style={{ color: '#ef5350' }}>decline</b>} this ticket?
                </div>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button onClick={() => setActionModal({ visible: false, type: null })} style={{ padding: '12px 25px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: 'transparent', color: colors.text, cursor: 'pointer', fontWeight: 'bold', fontFamily: fontPrimary, minWidth: '100px' }}>{t('Cancel')}</button>
                  <button
                    onClick={actionModal.type === 'confirm' ? handleConfirmTicket : handleDeclineTicket}
                    style={{ padding: '12px 25px', borderRadius: '8px', border: 'none', backgroundColor: actionModal.type === 'confirm' ? '#66bb6a' : '#ef5350', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontFamily: fontPrimary, minWidth: '100px' }}
                  >
                    {t('Proceed')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };


  return (
    <div style={pageWrapperStyle}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => processFile(e.target.files[0])} />
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '15px' : '30px' }}>
          {isMobile && (
            <div onClick={() => setShowMobileMenu(true)} style={{ cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center' }}>
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </div>
          )}
          <div onClick={handleReset} style={{ fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 'bold', fontFamily: fontLogo, letterSpacing: '3px', color: colors.logo, cursor: 'pointer', userSelect: 'none', transition: 'opacity 0.3s ease' }}>KRATER</div>
          {!isMobile && (messages.length > 0 || isScanning) && (
            <div onClick={handleReset} onMouseEnter={() => setIsHoveringNew(true)} onMouseLeave={() => setIsHoveringNew(false)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', opacity: isHoveringNew ? 0.7 : 1, transition: 'opacity 0.2s', marginLeft: '10px' }}>
              <div style={{ width: '34px', height: '34px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '50%', border: `1.5px solid #fff`, display: 'grid', placeItems: 'center' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="9" y1="10" x2="15" y2="10"></line><line x1="12" y1="7" x2="12" y2="13"></line></svg>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#fff', marginTop: '2px', fontFamily: fontPrimary }}>{t('NEW CHAT')}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '25px', marginLeft: isMobile ? 'auto' : '0' }}>
          {isMobile && !isOnline && (
            <div title={t('Offline Mode: Site functionality is currently limited.')} style={{ display: 'flex', alignItems: 'center', padding: '8px', backgroundColor: 'rgba(239, 83, 80, 0.25)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path></svg>
            </div>
          )}
          {user?.displayName === 'zxczxc' && (
            <div onClick={handleResetCounter} onMouseEnter={() => setIsHoveringReset(true)} onMouseLeave={() => setIsHoveringReset(false)} style={{ display: isMobile ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', opacity: isHoveringReset ? 0.7 : 1, transition: 'opacity 0.2s' }}>
              <div style={{ width: '34px', height: '34px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '50%', border: `1.5px solid #fff`, display: 'grid', placeItems: 'center' }}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg></div>
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#fff', marginTop: '2px', fontFamily: fontPrimary }}>{t('RESET COUNTER')}</span>
            </div>
          )}

          {!isOnline && (
            <div title={t('Offline Mode: Site functionality is currently limited.')} style={{ display: isMobile ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '5px' }}>
              <div style={{ width: '34px', height: '34px', backgroundColor: 'rgba(239, 83, 80, 0.2)', borderRadius: '50%', border: `1.5px solid #fff`, display: 'grid', placeItems: 'center' }}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path></svg></div>
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#fff', marginTop: '2px', fontFamily: fontPrimary }}>{t('OFFLINE MODE')}</span>
            </div>
          )}

          <div ref={languageMenuRef} style={{ position: 'relative' }}>
            <div onClick={() => { if (!isOnline) { setNotification({ visible: true, message: t('Localization is unavailable while offline.') }); setTimeout(() => setNotification({ visible: false, message: "" }), 3000); return; } setShowLanguageMenu(!showLanguageMenu); }} onMouseEnter={() => setIsHoveringLanguage(true)} onMouseLeave={() => setIsHoveringLanguage(false)} style={{ display: isMobile ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', opacity: (isHoveringLanguage || showLanguageMenu) ? 0.7 : 1, transition: 'opacity 0.2s', marginRight: '5px' }}>
              <div style={{ width: '34px', height: '34px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '50%', border: `1.5px solid #fff`, display: 'grid', placeItems: 'center' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#fff', marginTop: '2px', fontFamily: fontPrimary }}>{languageLabels[language].toUpperCase()}</span>
            </div>

            {showLanguageMenu && !isMobile && (
              <div style={{ ...popoverStyle, width: '180px' }}>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${isDarkMode ? '#475569' : '#eee'}`, backgroundColor: isDarkMode ? '#1e293b' : '#fcfcfc', color: isDarkMode ? '#fff' : colors.accent, fontWeight: 'bold', letterSpacing: '1px', textAlign: 'center' }}>
                  <span style={{ fontFamily: fontPrimary }}>{t('Language')}</span>
                </div>
                <div style={{ overflowY: 'auto', maxHeight: '300px' }} className="custom-scrollbar">
                  {Object.entries(languageLabels).map(([langKey, langLabel]) => (
                    <div
                      key={langKey}
                      onMouseEnter={(e) => e.target.style.backgroundColor = isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = language === langKey ? (isDarkMode ? '#475569' : '#eef6fc') : 'transparent'}
                      onClick={() => { setLanguage(langKey); setShowLanguageMenu(false); }}
                      style={{
                        padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background-color 0.2s',
                        backgroundColor: language === langKey ? (isDarkMode ? '#475569' : '#eef6fc') : 'transparent'
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', color: colors.text, fontWeight: language === langKey ? 'bold' : 'normal', pointerEvents: 'none' }}>
                        {langLabel}
                      </span>
                      {language === langKey && (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={colors.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', pointerEvents: 'none' }}>
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div onClick={() => setIsDarkMode(!isDarkMode)} onMouseEnter={() => setIsHoveringDarkToggle(true)} onMouseLeave={() => setIsHoveringDarkToggle(false)} style={{ display: isMobile ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', opacity: isHoveringDarkToggle ? 0.7 : 1, transition: 'opacity 0.2s' }}>
            <div style={{ width: '34px', height: '34px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '50%', border: `1.5px solid #fff`, display: 'grid', placeItems: 'center' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff">
                {isDarkMode ? <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" /> : <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />}
              </svg>
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#fff', marginTop: '2px', fontFamily: fontPrimary }}>{isDarkMode ? t('LIGHT MODE?') : t('DARK MODE?')}</span>
          </div>

          {userRole === 'admin' && (
            <div onClick={() => setViewMode(viewMode === 'admin' ? 'chat' : 'admin')} onMouseEnter={() => setIsHoveringAdminToggle(true)} onMouseLeave={() => setIsHoveringAdminToggle(false)} style={{ display: isMobile ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', opacity: isHoveringAdminToggle ? 0.7 : 1, transition: 'opacity 0.2s' }}>
              <div style={{ width: '34px', height: '34px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '50%', border: `1.5px solid #fff`, display: 'grid', placeItems: 'center' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {viewMode === 'admin' ? (
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  ) : (
                    <path d="M3 3h18v18H3zM9 3v18"></path>
                  )}
                </svg>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#fff', marginTop: '2px', fontFamily: fontPrimary }}>
                {viewMode === 'admin' ? t('CHAT VIEW') : t('ADMIN VIEW')}
              </span>
            </div>
          )}


          <div ref={historyAreaRef} style={{ position: 'relative' }}>
            <div onClick={() => { if (!isOnline) { setNotification({ visible: true, message: t('History is unavailable while offline.') }); setTimeout(() => setNotification({ visible: false, message: "" }), 3000); return; } setShowHistory(!showHistory); }} onMouseEnter={() => setIsHoveringHistory(true)} onMouseLeave={() => setIsHoveringHistory(false)} style={{ display: isMobile ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', opacity: (isHoveringHistory || showHistory) ? 0.7 : 1, transition: 'opacity 0.2s' }}>
              <div style={{ width: '34px', height: '34px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '50%', border: `1px solid #fff`, display: 'grid', placeItems: 'center' }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" /></svg>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#fff', marginTop: '2px', fontFamily: fontPrimary }}>{t('CHAT HISTORY')}</span>
            </div>

            {showHistory && !isMobile && (
              <div style={{ ...popoverStyle, width: '340px' }}>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${isDarkMode ? '#475569' : '#eee'}`, backgroundColor: isDarkMode ? '#1e293b' : '#fcfcfc', color: isDarkMode ? '#fff' : colors.accent, fontWeight: 'bold', letterSpacing: '1px' }}><span style={{ fontFamily: fontPrimary }}>{t('Recent Chats')}</span></div>
                <div style={{ overflowY: 'auto', maxHeight: '420px', flex: 1 }}>
                  {chatHistory.length === 0 ? <div style={{ padding: '30px 16px', textAlign: 'center', color: colors.subtext, fontSize: '0.9rem', fontFamily: fontPrimary }}>{t('No saved chats yet.')}</div> : (
                    chatHistory.map((chatItem) => (
                      <div key={chatItem.id} onClick={() => handleLoadChatFromHistory(chatItem)} onMouseEnter={() => setHoveredChatId(chatItem.id)} onMouseLeave={() => setHoveredChatId(null)} style={{ padding: '12px 14px', borderBottom: `1px solid ${isDarkMode ? '#475569' : '#f9f9f9'}`, cursor: 'pointer', backgroundColor: (chatItem.id === activeChatId || chatItem.id === hoveredChatId) ? (isDarkMode ? '#475569' : '#eef6fc') : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ minWidth: 0 }}><div style={{ fontWeight: 'bold', color: colors.text, fontFamily: fontPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chatItem.title}</div><div style={{ fontSize: '0.8rem', color: colors.subtext, fontFamily: fontPrimary }}>{new Date(chatItem.updatedAt).toLocaleString()}</div></div>
                        <button onClick={(e) => requestDeleteChatHistory(chatItem.id, e)} onMouseEnter={() => setHoveredDeleteChatId(chatItem.id)} onMouseLeave={() => setHoveredDeleteChatId(null)} title="Delete chat history" style={{ border: 'none', backgroundColor: hoveredDeleteChatId === chatItem.id ? (isDarkMode ? 'rgba(239, 83, 80, 0.22)' : 'rgba(239, 83, 80, 0.14)') : 'transparent', color: hoveredDeleteChatId === chatItem.id ? '#ef5350' : (hoveredChatId === chatItem.id ? '#ef5350' : colors.subtext), cursor: 'pointer', padding: '6px', borderRadius: '999px', display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'all 0.18s ease' }}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <div onClick={() => { if (!isOnline) { setNotification({ visible: true, message: t('User profile is unavailable while offline.') }); setTimeout(() => setNotification({ visible: false, message: "" }), 3000); return; } setShowUserMenu(!showUserMenu); }} style={{ display: isMobile ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', opacity: (showUserMenu || !isOnline) ? 0.7 : 1, transition: 'opacity 0.2s' }}>
              <div style={{ width: '34px', height: '34px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '50%', border: `1px solid #fff`, display: 'grid', placeItems: 'center' }}><svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg></div>
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#fff', marginTop: '2px', fontFamily: '"Century Gothic", sans-serif' }}>{user?.displayName || 'User'}</span>
            </div>
            {showUserMenu && !isMobile && (
              <div style={{ ...popoverStyle, width: '240px', maxHeight: 'auto' }}>
                <div style={{ padding: '16px', borderBottom: `1px solid ${colors.border}`, textAlign: 'center' }}><div style={{ fontSize: '0.8rem', color: colors.subtext, marginBottom: '4px', fontFamily: fontPrimary }}>{t('Welcome,')}</div><div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: colors.text, fontFamily: '"Century Gothic", sans-serif' }}>{user?.displayName || 'User'}!</div></div>
                <div onClick={() => { setShowLanding(true); setShowUserMenu(false); }} style={{ padding: '12px 16px', cursor: 'pointer', transition: 'background-color 0.2s', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', gap: '12px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg><span style={{ fontSize: '0.9rem', color: colors.text, fontWeight: 'bold', fontFamily: fontPrimary }}>{t('Home')}</span></div>
                <div onMouseEnter={() => setIsHoveringAdd(true)} onMouseLeave={() => setIsHoveringAdd(false)} onClick={handleAddAccount} style={{ padding: '12px 16px', cursor: 'pointer', transition: 'background-color 0.2s', backgroundColor: isHoveringAdd ? (isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)') : 'transparent', display: 'flex', alignItems: 'center', gap: '12px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="17" y1="11" x2="23" y2="11" /></svg><span style={{ fontSize: '0.9rem', color: colors.text, fontWeight: 'bold', fontFamily: fontPrimary }}>{t('Add another account')}</span></div>
                <div onMouseEnter={() => setIsHoveringSwitch(true)} onMouseLeave={() => setIsHoveringSwitch(false)} onClick={handleSwitchAccount} style={{ padding: '12px 16px', cursor: 'pointer', transition: 'background-color 0.2s', backgroundColor: isHoveringSwitch ? (isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)') : 'transparent', display: 'flex', alignItems: 'center', gap: '12px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg><span style={{ fontSize: '0.9rem', color: colors.text, fontWeight: 'bold', fontFamily: fontPrimary }}>{t('Switch Accounts')}</span></div>
                <div onMouseEnter={() => setIsHoveringSignOut(true)} onMouseLeave={() => setIsHoveringSignOut(false)} onClick={handleSignOut} style={{ padding: '12px 16px', cursor: 'pointer', transition: 'background-color 0.2s', backgroundColor: isHoveringSignOut ? (isDarkMode ? 'rgba(239, 83, 80, 0.2)' : 'rgba(239, 83, 80, 0.1)') : 'transparent', display: 'flex', alignItems: 'center', gap: '12px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg><span style={{ fontSize: '0.9rem', color: isHoveringSignOut ? '#ef5350' : colors.text, fontWeight: 'bold', fontFamily: fontPrimary }}>{t('Sign-Out')}</span></div>
              </div>
            )}
          </div>
        </div>
      </header>

      { }
      {isMobile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1100, display: 'flex', pointerEvents: showMobileMenu ? 'auto' : 'none' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', opacity: showMobileMenu ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }} onClick={() => setShowMobileMenu(false)} />
          <div style={{ position: 'relative', width: '280px', height: '100%', backgroundColor: isDarkMode ? '#1e293b' : '#fff', boxShadow: '2px 0 10px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', transform: showMobileMenu ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease-in-out' }}>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: fontLogo, letterSpacing: '1px', color: isDarkMode ? '#fff' : colors.accent }}>KRATER</div>
              <button onClick={() => setShowMobileMenu(false)} style={{ background: 'none', border: 'none', padding: '10px 0 10px 10px', cursor: 'pointer', color: colors.text }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
            <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div onClick={() => { handleReset(); setShowMobileMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '15px', color: colors.text, fontSize: '1.2rem', fontWeight: 'bold', fontFamily: fontPrimary, cursor: 'pointer' }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="9" y1="10" x2="15" y2="10"></line><line x1="12" y1="7" x2="12" y2="13"></line></svg> {t('NEW CHAT')}
              </div>
              <div onClick={() => { if (!isOnline) { setNotification({ visible: true, message: t('History is unavailable while offline.') }); setTimeout(() => setNotification({ visible: false, message: "" }), 3000); return; } setShowHistory(true); setShowMobileMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '15px', color: colors.text, fontSize: '1.2rem', fontWeight: 'bold', fontFamily: fontPrimary, cursor: 'pointer', opacity: isOnline ? 1 : 0.6 }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" /></svg> {t('CHAT HISTORY')}
              </div>
              <div onClick={() => setIsDarkMode(!isDarkMode)} style={{ display: 'flex', alignItems: 'center', gap: '15px', color: colors.text, fontSize: '1.2rem', fontWeight: 'bold', fontFamily: fontPrimary, cursor: 'pointer' }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">{isDarkMode ? <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" /> : <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />}</svg> {isDarkMode ? t('LIGHT MODE?') : t('DARK MODE?')}
              </div>

              <div ref={isMobile ? languageMenuRef : null} style={{ position: 'relative' }}>
                <div onClick={() => { if (!isOnline) { setNotification({ visible: true, message: t('Localization is unavailable while offline.') }); setTimeout(() => setNotification({ visible: false, message: "" }), 3000); return; } setShowLanguageMenu(!showLanguageMenu); }} style={{ display: 'flex', alignItems: 'center', gap: '15px', color: colors.text, fontSize: '1.2rem', fontWeight: 'bold', fontFamily: fontPrimary, cursor: 'pointer' }}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                  {t('Language')}: <span style={{ fontFamily: language === 'English' ? '"Century Gothic", sans-serif' : 'inherit' }}>{languageLabels[language]}</span>
                </div>
                {showLanguageMenu && isMobile && (
                  <div style={{ marginTop: '10px', backgroundColor: isDarkMode ? '#334155' : '#f8fafc', borderRadius: '12px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', overflow: 'hidden', animation: 'fadeInUp 0.2s ease' }}>
                    {Object.entries(languageLabels).map(([langKey, langLabel]) => (
                      <div
                        key={langKey}
                        onClick={() => { setLanguage(langKey); setShowLanguageMenu(false); }}
                        style={{
                          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', color: colors.text, fontSize: '1.1rem', cursor: 'pointer', transition: 'background 0.2s',
                          fontWeight: language === langKey ? 'bold' : 'normal'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        {langLabel}
                        {language === langKey && (
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={colors.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {userRole === 'admin' && (
                <div onClick={() => { setViewMode(viewMode === 'admin' ? 'chat' : 'admin'); setShowMobileMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '15px', color: colors.text, fontSize: '1.2rem', fontWeight: 'bold', fontFamily: fontPrimary, cursor: 'pointer' }}>
                  <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {viewMode === 'admin' ? (
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      ) : (
                        <path d="M3 3h18v18H3zM9 3v18"></path>
                      )}
                    </svg>
                  </div>
                  {viewMode === 'admin' ? t('Chat View') : t('Admin View')}
                </div>
              )}
            </div>
            <div style={{ padding: '20px', borderTop: `1px solid ${colors.border}`, position: 'relative' }}>
              {showUserMenu && (
                <div onMouseDown={(e) => e.stopPropagation()} style={{ position: 'absolute', bottom: '100%', left: '20px', right: '20px', marginBottom: '10px', backgroundColor: isDarkMode ? '#334155' : '#f8fafc', borderRadius: '12px', border: `1px solid ${colors.border}`, boxShadow: '0 -4px 15px rgba(0,0,0,0.1)', overflow: 'hidden', animation: 'fadeInUp 0.2s ease', zIndex: 10 }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border}`, textAlign: 'center' }}><div style={{ fontSize: '0.8rem', color: colors.subtext, marginBottom: '4px', fontFamily: fontPrimary }}>{t('Welcome,')}</div><div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: colors.text, fontFamily: fontPrimary }}>{user?.displayName || 'User'}!</div></div>
                  <div onClick={() => { setShowLanding(true); setShowMobileMenu(false); setShowUserMenu(false); }} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', color: colors.text, fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', borderBottom: `1px solid ${colors.border}`, fontFamily: fontPrimary }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> {t('Home')}</div>
                  <div onClick={() => { handleAddAccount(); setShowMobileMenu(false); }} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', color: colors.text, fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', borderBottom: `1px solid ${colors.border}`, fontFamily: fontPrimary }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="17" y1="11" x2="23" y2="11" /></svg> {t('Add another account')}</div>
                  <div onClick={() => { handleSwitchAccount(); setShowMobileMenu(false); }} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', color: colors.text, fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', borderBottom: `1px solid ${colors.border}`, fontFamily: fontPrimary }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg> {t('Switch Accounts')}</div>
                  <div onClick={() => { handleSignOut(); setShowMobileMenu(false); }} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#ef5350', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: fontPrimary }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg> {t('Sign-Out')}</div>
                </div>
              )}
              <div onClick={() => { if (!isOnline) { setNotification({ visible: true, message: t('User profile is unavailable while offline.') }); setTimeout(() => setNotification({ visible: false, message: "" }), 3000); return; } setShowUserMenu(!showUserMenu); }} style={{ display: 'flex', alignItems: 'center', gap: '15px', color: colors.text, fontSize: '1.2rem', fontWeight: 'bold', fontFamily: fontPrimary, cursor: 'pointer', opacity: isOnline ? 1 : 0.6 }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg> {user?.displayName || 'User'}
              </div>
            </div>
          </div>
        </div>
      )}

      { }
      {isMobile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1100, display: 'flex', pointerEvents: showHistory ? 'auto' : 'none' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', opacity: showHistory ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }} onClick={() => setShowHistory(false)} />
          <div onMouseDown={(e) => e.stopPropagation()} style={{ position: 'relative', width: '320px', maxWidth: '85%', height: '100%', backgroundColor: isDarkMode ? '#1e293b' : '#fcfcfc', boxShadow: '2px 0 10px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', transform: showHistory ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease-in-out' }}>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDarkMode ? '#475569' : '#eee'}` }}>
              <span style={{ fontFamily: fontPrimary, fontWeight: 'bold', fontSize: '1.2rem', color: isDarkMode ? '#fff' : colors.accent, letterSpacing: '1px' }}>{t('Recent Chats')}</span>
              <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', padding: '10px 0 10px 10px', cursor: 'pointer', color: colors.text }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {chatHistory.length === 0 ? <div style={{ padding: '30px 16px', textAlign: 'center', color: colors.subtext, fontSize: '0.9rem', fontFamily: fontPrimary }}>{t('No saved chats yet.')}</div> : (
                chatHistory.map((chatItem) => (
                  <div key={chatItem.id} onClick={() => { handleLoadChatFromHistory(chatItem); setShowHistory(false); }} style={{ padding: '16px 20px', borderBottom: `1px solid ${isDarkMode ? '#475569' : '#f9f9f9'}`, cursor: 'pointer', backgroundColor: chatItem.id === activeChatId ? (isDarkMode ? '#475569' : '#eef6fc') : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ minWidth: 0 }}><div style={{ fontWeight: 'bold', color: colors.text, fontFamily: fontPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '1.1rem' }}>{chatItem.title}</div><div style={{ fontSize: '0.85rem', color: colors.subtext, fontFamily: fontPrimary, marginTop: '4px' }}>{new Date(chatItem.updatedAt).toLocaleString()}</div></div>
                    <button onClick={(e) => { requestDeleteChatHistory(chatItem.id, e); setShowHistory(false); }} style={{ border: 'none', background: 'transparent', color: colors.subtext, padding: '10px', display: 'grid', placeItems: 'center' }}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      { }
      {viewMode === 'admin' ? (
        renderAdminDashboard()
      ) : (
        <main style={mainAreaStyle} onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}>
          <div ref={chatScrollRef} style={{ flex: 1, minHeight: 0, marginBottom: `${composerOccluderHeight}px`, overflowY: 'auto', overflowX: 'hidden', padding: '20px 0 0 0', display: 'flex', justifyContent: 'center', scrollPaddingBottom: '0px' }}>
            <div style={{ width: '90%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {messages.map((msg, idx) => (
                <div key={msg.id || idx} style={{ display: 'flex', flexDirection: 'column', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '75%', animation: 'fadeInUp 0.3s ease' }}>
                  <div style={{ backgroundColor: msg.sender === 'user' ? colors.accent : colors.botBubble, color: msg.sender === 'user' ? '#fff' : colors.text, padding: '14px 20px', borderRadius: '20px', borderBottomRightRadius: msg.sender === 'user' ? '4px' : '20px', borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '20px', fontFamily: fontPrimary, boxShadow: '0 4px 10px rgba(0,0,0,0.05)', wordBreak: 'break-word', boxSizing: 'border-box' }}>

                    {msg.image && (
                      <img src={msg.image} alt="Upload" style={{ width: '100%', borderRadius: '12px', marginBottom: msg.text ? '12px' : '0' }} />
                    )}

                    {msg.text && <div style={{ fontSize: '1rem', lineHeight: '1.5' }}>{msg.text}</div>}

                    {msg.reportData && (
                      <div style={{ marginTop: '16px', backgroundColor: colors.panel, padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>

                        {msg.reportData.processedImage ? (
                          <img src={msg.reportData.processedImage} alt="AI Processed" style={{ width: '100%', borderRadius: '8px', marginBottom: '16px', objectFit: 'contain', backgroundColor: isDarkMode ? '#1e293b' : '#f9f9f9', border: `1px solid ${colors.border}` }} />
                        ) : msg.reportData.image ? (
                          <img src={msg.reportData.image} alt="Analyzed Road" style={{ width: '100%', borderRadius: '8px', marginBottom: '16px', objectFit: 'contain', backgroundColor: isDarkMode ? '#1e293b' : '#f9f9f9', border: `1px solid ${colors.border}` }} />
                        ) : null}

                        <div style={{ fontSize: '0.8rem', color: colors.subtext, marginBottom: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>{t('TICKET:')} <span style={{ fontFamily: '"Century Gothic", sans-serif' }}>{msg.reportData.ticket}</span></div>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                          <div style={{ flex: 1 }}><div style={{ fontSize: '0.8rem', color: colors.subtext }}>{t('Potholes')}</div><div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{msg.reportData.potholes}</div></div>
                          <div style={{ flex: 1 }}><div style={{ fontSize: '0.8rem', color: colors.subtext }}>{t('Severity')}</div><div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: getSeverityColor(msg.reportData.severity) }}>{msg.reportData.severity}</div></div>
                        </div>

                        <hr style={{ borderTop: `1px dashed ${colors.border}`, borderBottom: 'none', margin: '15px 0' }} />

                        <div style={{ fontSize: '0.9rem', lineHeight: '1.8rem', fontFamily: fontPrimary, color: colors.text }}>
                          { }
                          <div style={{ marginBottom: '4px' }}>
                            <b>{t('Location:')} </b>
                            <span style={{ fontFamily: '"Century Gothic", sans-serif' }}>{msg.reportData.road}</span>
                          </div>
                          { }
                          {msg.reportData.location && msg.reportData.location !== 'Unknown Location' && (
                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px dashed ${colors.border}` }}>
                              <a
                                href={`http://maps.google.com/?q=$${msg.reportData.location}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: colors.accent, fontWeight: 'bold', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block' }}
                              >
                                📍 {t('Click here to view the location on Google Maps')}
                              </a>
                            </div>
                          )}

                          {!msg.reportData.isReported && msg.reportData.potholes > 0 && (
                            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleReportSubmit(msg.id, msg.reportData)}
                                style={{
                                  padding: '12px 24px',
                                  backgroundColor: colors.accent,
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontWeight: 'bold',
                                  fontSize: '1rem',
                                  cursor: 'pointer',
                                  fontFamily: fontPrimary,
                                  transition: 'background-color 0.2s',
                                  boxShadow: '0 4px 10px rgba(13, 148, 136, 0.3)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f766e'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.accent}
                              >
                                {t('Report')}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isScanning && (
                <div style={{ alignSelf: 'flex-start', maxWidth: '75%', backgroundColor: colors.botBubble, color: colors.text, padding: '14px 20px', borderRadius: '20px', borderBottomLeftRadius: '4px', fontFamily: fontPrimary }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{t('Analyzing Road Data... ')}{progress}%</span></div>
                  <div style={{ width: '200px', height: '6px', backgroundColor: isDarkMode ? '#475569' : '#e2e8f0', marginTop: '10px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', backgroundColor: colors.accent, transition: 'width 0.4s ease-out' }} />
                  </div>
                </div>
              )}

              {isBotTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px', animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ padding: '12px 18px', backgroundColor: isDarkMode ? '#334155' : '#f1f5f9', borderRadius: '20px', borderBottomLeftRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: '6px', height: '6px', backgroundColor: colors.subtext, borderRadius: '50%', animation: 'dotPulse 1.2s infinite ease-in-out', animationDelay: '0s' }} />
                    <div style={{ width: '6px', height: '6px', backgroundColor: colors.subtext, borderRadius: '50%', animation: 'dotPulse 1.2s infinite ease-in-out', animationDelay: '0.2s' }} />
                    <div style={{ width: '6px', height: '6px', backgroundColor: colors.subtext, borderRadius: '50%', animation: 'dotPulse 1.2s infinite ease-in-out', animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} style={{ height: 0, flexShrink: 0 }} />
            </div>
          </div>

          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${composerOccluderHeight}px`, backgroundColor: colors.bg, zIndex: 25, pointerEvents: 'none', transition: 'background-color 0.3s ease' }} />

          { }
          <div style={inputWrapperStyle}>
            {isChatEmpty && (
              <div style={{ textAlign: 'center', marginBottom: '20px', animation: 'fadeInUp 0.5s ease' }}>
                <h2 style={{ color: colors.text, fontWeight: 'bold', fontFamily: fontPrimary, margin: '0 0 8px 0' }}>{t('Hello')} {user?.displayName || 'User'}!</h2>
                <div style={{ color: colors.text, fontWeight: 'normal', fontSize: '1.2rem', fontFamily: fontPrimary }}>{t('How can I help you with road safety today?')}</div>
              </div>
            )}

            {previewImage && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px', animation: 'fadeInUp 0.3s ease' }}>
                { }
                <div style={{ alignSelf: 'flex-start', position: 'relative', padding: '6px', backgroundColor: colors.panel, borderRadius: '12px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                  <img src={previewImage} alt="Preview" style={{ height: '70px', borderRadius: '8px', objectFit: 'cover' }} />
                  <button onClick={() => { setPreviewImage(null); setSelectedFile(null); setSelectedDistrict(""); }} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef5350', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: '12px', fontWeight: 'bold' }}>✕</button>
                </div>

                { }
                <div style={{ alignSelf: 'flex-start', width: '100%', maxWidth: '350px', display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder={t('Street Name / Landmark')}
                    value={specificLocation}
                    onChange={(e) => setSpecificLocation(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: isDarkMode ? '#0f172a' : '#fff',
                      color: colors.text,
                      fontFamily: fontPrimary,
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    onClick={() => setShowMap(true)}
                    style={{ padding: '0 15px', backgroundColor: colors.accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    📍 Pin
                  </button>
                </div>

                { }
                {showMap && (
                  <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', zIndex: 9999
                  }}>
                    <div style={{ width: '90%', maxWidth: '600px', backgroundColor: colors.panel, padding: '20px', borderRadius: '15px', border: `1px solid ${colors.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: colors.text }}>
                        <h3 style={{ margin: 0, fontFamily: fontPrimary }}>Drag the pin to the exact location</h3>
                        <button onClick={() => setShowMap(false)} style={{ background: 'transparent', color: '#ef5350', border: 'none', cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold' }}>✕</button>
                      </div>

                      <div style={{ height: '350px', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                        <Map
                          mapboxAccessToken={MAPBOX_TOKEN}
                          initialViewState={{
                            longitude: pinLocation.longitude,
                            latitude: pinLocation.latitude,
                            zoom: 14
                          }}
                          mapStyle={isDarkMode ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/streets-v12"}
                          onClick={handlePinDrop}
                        >
                          <Marker
                            longitude={pinLocation.longitude}
                            latitude={pinLocation.latitude}
                            draggable
                            onDragEnd={handlePinDrop}
                            color="#ef5350"
                          />
                        </Map>
                      </div>

                      <button
                        onClick={() => setShowMap(false)}
                        style={{ width: '100%', marginTop: '20px', padding: '12px', backgroundColor: colors.accent, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: fontPrimary, fontSize: '1.1rem' }}
                      >
                        Confirm Location
                      </button>
                    </div>
                  </div>
                )}
                { }
                <div style={{ alignSelf: 'flex-start', width: '100%', maxWidth: '250px' }}>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: isDarkMode ? '#0f172a' : '#fff',
                      color: colors.text,
                      fontFamily: fontPrimary,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      outline: 'none',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}
                  >
                    <option value="" disabled>-- {t('Select your District')} --</option>
                    {knownDistricts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: colors.panel, border: `1px solid ${colors.border}`, borderRadius: '30px', padding: '8px 12px', boxShadow: isChatEmpty ? (isDarkMode ? '0 20px 40px rgba(0,0,0,0.4)' : '0 20px 40px rgba(0,0,0,0.1)') : '0 4px 15px rgba(0,0,0,0.05)', transition: 'all 0.3s ease' }}>
              <button onClick={() => fileInputRef.current.click()} style={{ background: 'transparent', border: 'none', color: colors.subtext, cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Attach Image">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={isChatEmpty ? (isMobile ? t("Upload a Photo...") : t("Upload a Photo and Describe the Issue...")) : t("Type a message...")} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: colors.text, fontSize: isMobile ? '0.85rem' : '1rem', fontFamily: fontPrimary, padding: '0 12px' }} />
              <button onClick={handleSendMessage} disabled={!inputText.trim() && !previewImage} style={{ background: (inputText.trim() || previewImage) ? colors.accent : (isDarkMode ? '#475569' : '#e2e8f0'), color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: (inputText.trim() || previewImage) ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }} title="Send Message">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
              </button>
            </div>
          </div>

          <div onDragOver={(e) => e.preventDefault()} onDragLeave={(e) => { e.preventDefault(); setIsDraggingOver(false); }} onDrop={(e) => { e.preventDefault(); setIsDraggingOver(false); processFile(e.dataTransfer.files[0]); }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)', zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', border: `3px dashed ${colors.accent}`, margin: '15px', borderRadius: '20px', opacity: isDraggingOver ? 1 : 0, pointerEvents: isDraggingOver ? 'auto' : 'none', transform: isDraggingOver ? 'scale(1)' : 'scale(0.98)', boxShadow: isDraggingOver ? '0 0 40px rgba(59, 130, 246, 0.3)' : 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <h2 style={{ color: colors.accent, fontFamily: fontPrimary, pointerEvents: 'none' }}>{t('Drop image to attach to chat')}</h2>
          </div>

          {showDeleteChatModal && (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.28)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ width: 'calc(100% - 30px)', maxWidth: '460px', boxSizing: 'border-box', backgroundColor: colors.panel, color: colors.text, borderRadius: '14px', border: `1px solid ${colors.border}`, boxShadow: isDarkMode ? '0 16px 30px rgba(0,0,0,0.5)' : '0 16px 30px rgba(0,0,0,0.2)', padding: '20px', animation: 'fadeInUp 0.25s ease' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '8px' }}>{t('Are you sure you want to clear this history?')}</div>
                <div style={{ fontSize: '0.9rem', color: colors.subtext, marginBottom: '20px' }}>{t("This chat will be removed from Chat History.")}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={closeDeleteChatModal} style={{ border: `1px solid ${colors.border}`, backgroundColor: 'transparent', color: colors.text, borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontFamily: fontPrimary }}>{t('No')}</button>
                  <button onClick={confirmDeleteChatHistory} style={{ border: 'none', backgroundColor: '#ef5350', color: '#fff', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontWeight: 'bold', fontFamily: fontPrimary }}>{t('Yes')}</button>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {notification.visible && (
        <div style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '12px 24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', zIndex: 9999, pointerEvents: 'none', animation: 'slideUpFadeOut 3s ease-in-out forwards', fontFamily: fontPrimary, fontSize: '0.9rem', fontWeight: '600', textAlign: 'center', minWidth: '280px' }}>
          {notification.message}
        </div>
      )}

      {(isStatusUpdating || isAdminLoading) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, cursor: 'wait', pointerEvents: 'auto', backgroundColor: 'transparent' }} />
      )}
    </div>
  );
}

export default App;