// pages/kit-test.tsx
import React from 'react';
import KitServiceTester from '../../components/KitServiceTester';

export default function KitTestPage() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Kit Service Testing</h1>
          <KitServiceTester />
        </div>
      </div>
    </>
  );
}