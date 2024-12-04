import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

// CREATE
export const createRunning = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'runnings'), data);
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding document: ', error);
  }
};

// READ
export const getRunnings = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'runnings'));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching documents: ', error);
  }
};

// UPDATE
export const updateRunning = async (docId, updatedData) => {
  try {
    const docRef = doc(db, 'runnings', docId);
    await updateDoc(docRef, updatedData);
    console.log('Document updated successfully');
  } catch (error) {
    console.error('Error updating document: ', error);
  }
};

// DELETE
export const deleteRunning = async (docId) => {
  try {
    const docRef = doc(db, 'runnings', docId);
    await deleteDoc(docRef);
    console.log('Document deleted successfully');
  } catch (error) {
    console.error('Error deleting document: ', error);
  }
};
