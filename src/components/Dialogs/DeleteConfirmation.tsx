import React from 'react';
import { Button } from "@/components/ui/button";
import { DeleteConfirmationProps } from '@/types';

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ habitName, onCancel, onConfirm }) => {
  return (
    <>
      <div className='text-center pt-4 text-base'>
        Are you sure you want to delete the habit &quot;<span className='font-black'>{habitName}</span>&quot;? 
        <br/> This action cannot be undone.
      </div>
      <div className="flex mx-auto space-x-4 max-w-96 pt-4">
        <Button variant="outline" className='w-full' onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="destructive" className='w-full' onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </>
  );
};

export default DeleteConfirmation;
