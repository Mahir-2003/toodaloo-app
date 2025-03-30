import { auth, db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export const getUserPreferences = async () => {
    try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
            // return default preferences if not logged in
            return {
                accessible: false,
                changing_table: false,
                unisex: false
            };
        }

        const userDoc = await getDoc(doc(db, "users", currentUser.uid));

        if (userDoc.exists() && userDoc.data().preferences) {
            return userDoc.data().preferences;
        }

        // if not found, return default preferences
        return {
            accessible: false,
            changing_table: false,
            unisex: false
        }
    } catch (error) {
        console.log("Error fetching user preferences:", error);
        return {
            accessible: false,
            changing_table: false,
            unisex: false
        };
    }
}