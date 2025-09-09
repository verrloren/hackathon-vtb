'use client'
import { Toaster } from "react-hot-toast";


export function ToasterProvider()  {
	return <Toaster position="bottom-left" toastOptions={{
		style: {
			backgroundColor: '#000000f7',
      border: '1px solid #262626',
      padding: '24px',
      color: '#f7f7f7',
			borderRadius: '16px',
    } 
	}} />;
};
