/// <reference types="expo/types" />

// expo-router/entry tip bildirimi sağlamaz (sadece side-effect entry).
// index.ts'teki re-export'un implicit-any (TS7016) hatasını giderir.
declare module 'expo-router/entry';
