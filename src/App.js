import React, { useState, useEffect } from 'react';

import './App.css';

async function resizeImage(file, ratio, quality) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      const base64Image = reader.result.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
      try {
        const response = await fetch('http://127.0.0.1:5000/resize_image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            base64_image: base64Image,
            ratio: ratio,
            quality: quality,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          resolve(data.resized_image);
        } else {
          reject(new Error('Failed to resize image'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
}

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

  const [file, setFile] = useState(null);
  const [ratio, setRatio] = useState(1);
  const [quality, setQuality] = useState(80);
  const [result, setResult] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleRatioChange = (event) => {
    setRatio(event.target.value);
  };

  const handleQualityChange = (event) => {
    setQuality(event.target.value);
  };

  const handleResize = async () => {
    try {
      const data = await resizeImage(file, ratio, quality);
      setResult(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input_texts: [inputText] }),
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
      body: JSON.stringify({ input_texts: [inputText],
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

    <div>
      <h1>Image Resizer</h1>
      <div>
        <label htmlFor="file">File:</label>
        <input type="file" id="file" onChange={handleFileChange} />
      </div>
      <div>
        <label htmlFor="ratio">Ratio:</label>
        <input type="float" id="width" value={ratio} onChange={handleRatioChange} />
      </div>
      <div>
        <label htmlFor="quality">Quality:</label>
        <input type="number" id="quality" value={quality} onChange={handleQualityChange} />
      </div>
      <button onClick={handleResize}>Resize</button>
      {result && (
        <div>
          <h2>Result:</h2>
          <img src={`data:image/jpeg;base64,${result}`} alt="Resized Image" />
        </div>
      )}
    </div>

  </div>
);

}

export default TextGeneratorApp;