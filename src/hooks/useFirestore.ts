import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';

export const useFirestoreCollection = <T>(collectionName: string) => {
  return useQuery({
    queryKey: [collectionName],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const useFirestoreDocument = <T>(collectionName: string, id: string) => {
  return useQuery({
    queryKey: [collectionName, id],
    queryFn: async () => {
      const docRef = doc(db, collectionName, id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() } as T;
    },
    enabled: !!id,
  });
};

export const useUpdateDocument = (collectionName: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [collectionName] });
    },
  });
};
