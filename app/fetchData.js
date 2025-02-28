import { db } from "../firebase"; 
import { doc, getDoc } from "firebase/firestore"; 

async function fetchDocument() {
    try {
        console.log("Fetching data...");
        const docRef = doc(db, "budgets", "4DESVTmQdmm4apY14LiH");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error fetching document:", error);
    }
}

fetchDocument();
