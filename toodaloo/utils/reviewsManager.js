import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, 
    getDocs, query, where, arrayUnion, arrayRemove} from 'firebase/firestore';
import { db, auth } from './firebaseConfig';

// create new review
export const createReview = async (reviewData) => {
    try {
        // add review to db
        const  now = new Date();
        const reviewRef = await addDoc(collection(db, 'reviews'), {
            text: reviewData.text,
            toiletID: reviewData.toiletID,
            likes: 0,
            dislikes: 0,
            userID: auth.currentUser.uid,
            createdAt: now,
            updatedAt: now

        });

        // update user's reviews array to include new review ID
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
            reviews: arrayUnion(reviewRef.id)
        });

        return reviewRef.id;
    } catch (error) {
        console.log("error creating review:", error);
        throw error;
    }
};

// get reviews for a specific toilet
export const getToiletReviews = async (toiletID) => {
    try {
        const q = query(collection(db, 'reviews'), where('toiletID', '==', toiletID));
        const querySnapshot = await getDocs(q);

        const reviews = [];
        querySnapshot.forEach((doc) => {
            reviews.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return reviews;
    } catch (error) {
        console.log("error fetching reviews:", error);
        throw error;
    } 
}

// get reviews made by a specific user
export const getUserReviews = async (userID) => {
    try {
        const q = query(collection(db, 'reviews'), where('userID', '==', userID));
        const querySnapshot = await getDocs(q);

        const reviews = []
        querySnapshot.forEach((doc) => {
            reviews.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return reviews;
    } catch (error) {
        console.log('Error fetching user reviews:', error);
        throw error;
    }
};

// delete a review
export const updateReview = async (reviewID, newText) => {
    try {
        const reviewRef = doc(db, 'reviews', reviewID);
        await updateDoc(reviewRef, {
            text: newText,
            updatedAt: new Date()
        });
    } catch (error) {
        console.log('Error updating user review:', error);
        throw error;
    }
};

export const deleteReview = async (reviewID) => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('User not authenticated');
        }

        // get review and verify user owns it
        const reviewRef = doc(db, 'reviews', reviewID);
        const reviewDoc = await getDoc(reviewRef);

        if (!reviewDoc.exists()) {
            throw new Error('Review not found');
        }        
        
        const reviewData = reviewDoc.data();
        if (reviewData.userID !== currentUser.uid) {
            throw new Error('User not authorized to delete this review');
        }

        // remove review from user's reviews array + the actual database
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
            reviews: arrayRemove(reviewID)
        });

        await deleteDoc(reviewRef);
    } catch (error) {
        console.log('Error deleting user review:', error);
        throw error;
    }
};

export const likeReview = async (reviewID) => {
    try {
        const reviewRef = doc(db, 'reviews', reviewID);
        await updateDoc(reviewRef, {
            likes: increment(1)
        });
    } catch (error) {
        console.log('Error liking review:', error);
        throw error;
    }
};

// dislike a review
export const dislikeReview = async (reviewID) => {
    try {
        const reviewRef = doc(db, 'reviews', reviewID);
        await updateDoc(reviewRef, {
            dislikes: decrement(1)
        });
    } catch (error) {
        console.log('Error disliking review', error);
        throw error;
    }
};
