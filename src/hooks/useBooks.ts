"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { BOOKS } from "@/lib/books-data";
import { compressImage } from "@/lib/image-utils";

const LOCAL_STORAGE_KEY = "babe_jaka_admin_books";

export interface Book {
  id: string | number;
  title: string;
  theme: string;
  desc: string;
  cover: string;
  illustration: string;
  level: string;
  grade: string;
  pages: { text: string; image: string }[];
  isLocal?: boolean;
  createdAt?: string;
}

export function useBooks() {
  const [localBooksData, setLocalBooksData] = useState<Book[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setLocalBooksData(JSON.parse(saved));
      }
      setIsLoaded(true);
    } catch (err) {
      console.error("Error loading books from localStorage:", err);
      setError("Gagal memuat data dari browser.");
      setIsLoaded(true);
    }
  }, []);

  // Sync state to localStorage
  const syncToStorage = useCallback((books: Book[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(books));
      setLocalBooksData(books);
    } catch (err) {
      console.error("Error saving to localStorage:", err);
      if (err instanceof DOMException && err.name === "QuotaExceededError") {
        alert("Penyimpanan browser penuh! Mohon hapus beberapa buku atau perkecil ukuran gambar.");
      }
      throw err;
    }
  }, []);

  const allBooks: Book[] = useMemo(() => [...BOOKS, ...localBooksData], [localBooksData]);

  const addBook = useCallback(async (newBook: Omit<Book, "id" | "isLocal">, onProgress?: (progress: number, message: string) => void) => {
    try {
      const timestamp = Date.now();
      const totalTasks = 2 + newBook.pages.length;
      let completedTasks = 0;

      const reportProgress = (msg: string) => {
        completedTasks++;
        if (onProgress) {
          onProgress(Math.min(98, Math.round((completedTasks / totalTasks) * 100)), msg);
        }
      };

      // Helper for compression (storing as base64 in localStorage)
      // Reducing maxWidth and quality to stay within 5MB limit
      const processImageLocal = async (img: string, msg: string) => {
        if (!img || !img.startsWith('data:image')) return img;
        // Using stricter constraints for localStorage: 800px max, 0.6 quality
        const compressed = await compressImage(img, 800, 0.6);
        reportProgress(msg);
        return compressed;
      };

      // 1. Process cover and illustration
      if (onProgress) onProgress(5, "Memproses sampul...");
      let coverUrl = newBook.cover;
      if (coverUrl.startsWith('data:image')) {
        coverUrl = await compressImage(coverUrl, 800, 0.6);
      }
      reportProgress("Sampul selesai diproses");
      
      if (onProgress) onProgress(15, "Memproses ilustrasi utama...");
      let illustrationUrl = newBook.illustration;
      if (illustrationUrl.startsWith('data:image')) {
        illustrationUrl = await compressImage(illustrationUrl, 800, 0.6);
      }
      reportProgress("Ilustrasi utama selesai diproses");

      // 2. Process pages
      const updatedPages = [];
      for (let i = 0; i < newBook.pages.length; i++) {
        const page = newBook.pages[i];
        if (onProgress) onProgress(Math.round((completedTasks / totalTasks) * 100), `Memproses halaman ${i + 1} dari ${newBook.pages.length}...`);
        
        let imageUrl = page.image;
        if (imageUrl.startsWith('data:image')) {
          imageUrl = await compressImage(imageUrl, 1024, 0.6);
        }
        updatedPages.push({ ...page, image: imageUrl });
        reportProgress(`Halaman ${i + 1} selesai`);
      }

      const finalBook: Book = {
        ...newBook,
        id: `local_${timestamp}`,
        cover: coverUrl,
        illustration: illustrationUrl,
        pages: updatedPages,
        isLocal: true,
        createdAt: new Date().toISOString()
      };

      // 3. Save to localStorage using functional update to avoid stale data
      setLocalBooksData(currentBooks => {
        const newList = [...currentBooks, finalBook];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newList));
        return newList;
      });
      
      if (onProgress) onProgress(100, "Buku berhasil disimpan!");
      return finalBook;
    } catch (err) {
      console.error("Error adding book locally:", err);
      throw err;
    }
  }, [localBooksData, syncToStorage]);

  const deleteBook = useCallback(async (id: string | number) => {
    try {
      const updatedList = localBooksData.filter(b => b.id !== id);
      syncToStorage(updatedList);
    } catch (err) {
      console.error("Error deleting book locally:", err);
      throw err;
    }
  }, [localBooksData, syncToStorage]);

  const updateBook = useCallback(async (id: string | number, updatedData: Partial<Book>, onProgress?: (progress: number, message: string) => void) => {
    try {
      const bookIndex = localBooksData.findIndex(b => b.id === id);
      if (bookIndex === -1) return;

      let finalBook = { ...localBooksData[bookIndex], ...updatedData };
      
      // Count tasks for progress
      let totalTasks = 0;
      if (updatedData.cover && updatedData.cover.startsWith('data:image')) totalTasks++;
      if (updatedData.pages) {
        totalTasks += updatedData.pages.filter(p => p.image && p.image.startsWith('data:image')).length;
      }
      
      let completedTasks = 0;
      const reportProgress = (msg: string) => {
        completedTasks++;
        if (onProgress) {
          onProgress(Math.min(98, Math.round((completedTasks / totalTasks) * 100)), msg);
        }
      };

      const processImageLocal = async (img: string, msg: string) => {
        if (!img || !img.startsWith('data:image')) {
          reportProgress(msg);
          return img;
        }
        const compressed = await compressImage(img, 800, 0.6);
        reportProgress(msg);
        return compressed;
      };

      // Update images if changed
      if (updatedData.cover && updatedData.cover.startsWith('data:image')) {
        if (onProgress) onProgress(5, "Memperbarui sampul...");
        finalBook.cover = await processImageLocal(updatedData.cover, "Sampul diperbarui");
      }

      if (updatedData.pages) {
        const updatedPages = [];
        for (let i = 0; i < updatedData.pages.length; i++) {
          const page = updatedData.pages[i];
          if (page.image && page.image.startsWith('data:image')) {
            if (onProgress) onProgress(Math.round((completedTasks / totalTasks) * 100), `Memperbarui halaman ${i+1}...`);
            const imageUrl = await processImageLocal(page.image, `Halaman ${i+1} diperbarui`);
            updatedPages.push({ ...page, image: imageUrl });
          } else {
            updatedPages.push(page);
          }
        }
        finalBook.pages = updatedPages;
      }

      setLocalBooksData(currentBooks => {
        const newList = [...currentBooks];
        newList[bookIndex] = finalBook;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newList));
        return newList;
      });

      if (onProgress) onProgress(100, "Perubahan berhasil disimpan!");
    } catch (err) {
      console.error("Error updating book locally:", err);
      throw err;
    }
  }, [localBooksData, syncToStorage]);

  const getBookById = useCallback((id: string | number) => {
    return allBooks.find((b) => String(b.id) === String(id));
  }, [allBooks]);

  return {
    allBooks,
    localBooks: localBooksData,
    addBook,
    deleteBook,
    updateBook,
    getBookById,
    isLoaded,
    error
  };
}
