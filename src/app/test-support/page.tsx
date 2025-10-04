'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SupabaseSupport } from '@/lib/supabase-support';
import { supabase } from '@/lib/supabase-client';

export default function TestSupportPage() {
  const { user, profile } = useAuth();
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const runFullTest = async () => {
    setIsLoading(true);
    setTestResult('🧪 Running full support system test...\n\n');
    
    try {
      // Test 1: Check authentication
      setTestResult(prev => prev + '1️⃣ AUTHENTICATION TEST\n');
      setTestResult(prev => prev + `   useAuth hook - user: ${user?.uid || 'null'}\n`);
      setTestResult(prev => prev + `   useAuth hook - profile: ${profile?.email || 'null'}\n`);
      
      const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        setTestResult(prev => prev + `   ❌ Supabase auth error: ${authError.message}\n\n`);
        return;
      }
      
      setTestResult(prev => prev + `   ✅ Supabase user: ${supabaseUser?.id || 'null'}\n\n`);
      
      // Test 2: Database connection
      setTestResult(prev => prev + '2️⃣ DATABASE CONNECTION TEST\n');
      const { data: testData, error: dbError } = await supabase
        .from('support_messages')
        .select('count(*)')
        .limit(1);
      
      if (dbError) {
        setTestResult(prev => prev + `   ❌ Database error: ${dbError.message}\n\n`);
        return;
      }
      
      setTestResult(prev => prev + '   ✅ Database connection working\n\n');
      
      // Test 3: Fetch existing messages
      setTestResult(prev => prev + '3️⃣ FETCH MESSAGES TEST\n');
      const userMessages = await SupabaseSupport.getUserMessages();
      setMessages(userMessages);
      setTestResult(prev => prev + `   📨 Found ${userMessages.length} existing messages\n`);
      userMessages.forEach((msg, index) => {
        setTestResult(prev => prev + `   ${index + 1}. "${msg.subject}" - ${msg.status}\n`);
      });
      setTestResult(prev => prev + '\n');
      
      // Test 4: Create test message
      setTestResult(prev => prev + '4️⃣ CREATE MESSAGE TEST\n');
      if (!supabaseUser) {
        setTestResult(prev => prev + '   ❌ No user to create message\n\n');
        return;
      }
      
      const testMessage = await SupabaseSupport.addMessage({
        userName: profile?.first_name || 'Test User',
        userEmail: profile?.email || supabaseUser.email || 'test@example.com',
        subject: 'Test Message ' + Date.now(),
        message: 'This is a test message to verify persistence',
        category: 'general',
        priority: 'medium'
      });
      
      if (testMessage) {
        setTestResult(prev => prev + `   ✅ Message created: ${testMessage.id}\n`);
        setTestResult(prev => prev + `   📝 Subject: ${testMessage.subject}\n\n`);
        
        // Test 5: Fetch messages again
        setTestResult(prev => prev + '5️⃣ PERSISTENCE TEST\n');
        const updatedMessages = await SupabaseSupport.getUserMessages();
        setMessages(updatedMessages);
        setTestResult(prev => prev + `   📨 Now have ${updatedMessages.length} messages\n`);
        
        const newMessage = updatedMessages.find(m => m.id === testMessage.id);
        if (newMessage) {
          setTestResult(prev => prev + '   ✅ New message found in database\n');
        } else {
          setTestResult(prev => prev + '   ❌ New message NOT found in database\n');
        }
      } else {
        setTestResult(prev => prev + '   ❌ Failed to create message\n');
      }
      
      setTestResult(prev => prev + '\n🎉 Test completed!\n');
      
    } catch (error) {
      setTestResult(prev => prev + `❌ Unexpected error: ${error}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTestMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('support_messages')
        .delete()
        .eq('user_id', user.id)
        .like('subject', 'Test Message%');
      
      setTestResult('🧹 Test messages cleared\n');
      const updatedMessages = await SupabaseSupport.getUserMessages();
      setMessages(updatedMessages);
    } catch (error) {
      setTestResult(`❌ Error clearing messages: ${error}\n`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Support System Test Page</h1>
        
        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">Please log in to test the support system.</p>
          </div>
        )}
        
        {user && (
          <div className="space-y-6">
            {/* Test Controls */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
              <div className="flex gap-4">
                <button
                  onClick={runFullTest}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Running Tests...' : 'Run Full Test'}
                </button>
                <button
                  onClick={clearTestMessages}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Clear Test Messages
                </button>
              </div>
            </div>
            
            {/* Test Results */}
            {testResult && (
              <div className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-lg font-semibold mb-4">Test Results</h2>
                <pre className="text-sm whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded overflow-auto max-h-96">
                  {testResult}
                </pre>
              </div>
            )}
            
            {/* Current Messages */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-lg font-semibold mb-4">Current Messages ({messages.length})</h2>
              {messages.length === 0 ? (
                <p className="text-gray-500">No messages found</p>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="border border-gray-200 rounded p-3">
                      <div className="font-medium">{msg.subject}</div>
                      <div className="text-sm text-gray-600">{msg.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Status: {msg.status} | Created: {new Date(msg.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
