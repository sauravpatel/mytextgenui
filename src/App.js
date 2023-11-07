import React, { useState, useEffect } from 'react';
import './App.css';

function TextGeneratorApp() {
  // Initialize state using local storage or default values
  const [inputText, setInputText] = useState(
    localStorage.getItem('inputText') || ''
  );
  const [outputText, setOutputText] = useState(
    localStorage.getItem('outputText') || ''
  );
  const [editorText, setEditorText] = useState(
    localStorage.getItem('editorText') || ''
  );

  const [srcLanguage, setSrcLanguage] = useState('te_IN');
  const [targetLanguage, setTargetLanguage] = useState('en_XX');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: [inputText] }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(JSON.stringify(data, null, 4));
        const generated_text = data?.choices[0]?.text;
        setOutputText(generated_text);
        localStorage.setItem('outputText', generated_text);
      } else {
        console.error('Error:', response.status);
        setOutputText('Error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setOutputText('Error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      await handleSubmit(e);
    }
  };

  // Save text to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('inputText', inputText);
    localStorage.setItem('editorText', editorText);
}, [inputText, editorText]);

const handleTranslate = async (e) => {
  // Additional logic for translation API call if needed
  // You can use a translation API here to translate text from src to target language
  // Update the state with the translated text
  // For now, let's set the translated text to a placeholder
  e.preventDefault();
    setIsLoading(true);
  try {
    const response = await fetch('http://127.0.0.1:5000/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: inputText,
      src_lang: srcLanguage,
      tgt_lang: targetLanguage }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(JSON.stringify(data, null, 4));
      const generated_text = data;
      setOutputText(generated_text);
      localStorage.setItem('outputText', generated_text);
    } else {
      console.error('Error:', response.status);
      setOutputText('Error occurred. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    setOutputText('Error occurred. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

return (
  <div style={{ marginTop: '20px' }}>
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '16px' }}>
          Prompt:
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={10}
            style={{ width: '50%' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <button type="submit" style={{ fontSize: '16px' }}>
          Generate Text
        </button>
      </div>

      {/* Language Selection */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '16px' }}>
          Source Language:
          <select
            value={srcLanguage}
            onChange={(e) => setSrcLanguage(e.target.value)}
          >
            <option value="te_IN">Telugu</option>
            <option value="en_XX">English</option>
            {/* Add more language options as needed */}
          </select>
        </label>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '16px' }}>
          Target Language:
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            <option value="en_XX">English</option>
            <option value="te_IN">Telugu</option>
            {/* Add more language options as needed */}
          </select>
        </label>
      </div>

      {/* Translation Button */}
      <div style={{ marginBottom: '10px' }}>
        <button onClick={handleTranslate} style={{ fontSize: '16px' }}>
          Translate Text
        </button>
      </div>

      <div style={{ marginBottom: '10px' }}>
      {isLoading && <div>Loading...</div>}
        <label style={{ fontSize: '16px' }}>
          Output:
          <textarea value={outputText} 
          rows={20}
          style={{ width: '50%' }}
          readOnly />
        </label>
        
      </div>
    </form>

    <div style={{ marginTop: '20px' }}>
      <label style={{ fontSize: '16px' }}>
        Text Editor:
        <textarea
          value={editorText}
          placeholder="Write or edit text here..."
          rows={40}
          style={{ width: '75%' }}
          onChange={(e) => setEditorText(e.target.value)}
        />
      </label>
    </div>

  </div>
);

}

export default TextGeneratorApp;