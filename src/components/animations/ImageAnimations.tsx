"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ReactNode } from "react";

export function AnimatedImage({ 
  src, 
  alt, 
  className,
}: { 
  src?: string; 
  alt?: string; 
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 1.1 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {src && (
        <Image 
          src={src} 
          alt={alt || ''} 
          fill
          className="object-cover" 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}
    </motion.div>
  );
}

export function ImageGalleryItem({ 
  children, 
  index 
}: { 
  children: ReactNode; 
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  );
}
