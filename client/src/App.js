import React, { useState, useRef } from 'react';
import axios from 'axios';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext'; // Text dikhane ke liye

function App() {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [repoName, setRepoName] = useState('');

  const fgRef = useRef();

  // --- DATA PROCESSING (Tree Logic with Smart Descriptions) ---
  const processData = (rawNodes) => {
    const nodes = [];
    const links = [];
    const added = new Set();

    // Root Node
    nodes.push({ id: 'root', name: 'ROOT', group: 'root', color: '#ff4444', size: 20 });
    added.add('root');

    rawNodes.forEach(file => {
      const parts = file.id.split('/');
      let parentId = 'root';

      parts.forEach((part, idx) => {
        const currentId = parts.slice(0, idx + 1).join('/');
        
        if (!added.has(currentId)) {
          // Check: Kya ye loop ka last item hai? (File ya Folder jo backend se aaya)
          const isTargetNode = (currentId === file.id);
          const isFile = (idx === parts.length - 1) && (file.type === 'blob');
          
          nodes.push({
            id: currentId,
            name: part,
            // ✨ NEW: Backend se aaya hua meaning (Info) yahan jod rahe hain
            desc: isTargetNode ? file.info : null, 
            
            group: isFile ? 'file' : 'folder',
            color: isFile ? '#00d8ff' : '#ffdd00', // Blue for File, Yellow for Folder
            size: isFile ? 6 : 12
          });
          added.add(currentId);
          links.push({ source: parentId, target: currentId });
        }
        parentId = currentId;
      });
    });

    return { nodes, links };
  };

  // --- GENERATE GRAPH ---
  const handleGenerate = async () => {
    if (!url || !email) return alert("Please fill all details!");
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/generate', { url, email });
      if (res.data.success) {
        const tree = processData(res.data.data.nodes);
        setGraphData(tree);
        setRepoName(url.split('/').pop());
      } else {
        alert("Error: " + res.data.message);
      }
    } catch (err) {
      alert("Server Error. Check Backend Console.");
    }
    setLoading(false);
  };

  // --- DOWNLOAD HTML ---
  const handleDownload = () => {
    const html = `
      <html><head><title>${repoName} 3D</title>
      <script src="//unpkg.com/3d-force-graph"></script>
      <style>body{margin:0; background:#050505;}</style></head><body>
      <div id="graph"></div>
      <script>
        const gData = ${JSON.stringify(graphData)};
        ForceGraph3D()(document.getElementById('graph'))
          .graphData(gData)
          .dagMode('td')
          .dagLevelDistance(60)
          .nodeAutoColorBy('group')
          .linkDirectionalParticles(2)
          .nodeLabel('id');
      </script></body></html>`;
      
    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${repoName}-3d-report.html`;
    link.click();
  };

  return (
    <div style={styles.container}>
      
      {/* --- SIDEBAR (Left) --- */}
      <div style={styles.sidebar}>
        <h2 style={{ color: '#00d8ff', marginBottom: '20px' }}>🌲 Repo Visualizer</h2>
        
        {/* Inputs */}
        <div style={styles.inputGroup}>
          <label>GitHub URL</label>
          <input style={styles.input} placeholder="https://github.com/user/repo" value={url} onChange={e=>setUrl(e.target.value)} />
        </div>

        <div style={styles.inputGroup}>
          <label>Email Address</label>
          <input style={styles.input} placeholder="name@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>

        <button onClick={handleGenerate} disabled={loading} style={styles.button}>
          {loading ? 'Processing...' : '🚀 Generate 3D Tree'}
        </button>

        <hr style={{ borderColor: '#444', margin: '20px 0' }} />

        {/* Legend */}
        <div style={styles.legend}>
          <h4>Legend (Colors)</h4>
          <div style={styles.legendItem}><span style={{...styles.dot, background:'#ff4444'}}></span> Root (Start)</div>
          <div style={styles.legendItem}><span style={{...styles.dot, background:'#ffdd00'}}></span> Folders</div>
          <div style={styles.legendItem}><span style={{...styles.dot, background:'#00d8ff'}}></span> Files</div>
        </div>

        {/* Download Section */}
        {graphData && (
          <div style={{ marginTop: '20px' }}>
             <button onClick={handleDownload} style={{...styles.button, background: '#28a745'}}>
               ⬇ Download Report
             </button>
             <p style={{fontSize:'12px', color:'#aaa', marginTop:'5px'}}>*Email sent successfully</p>
          </div>
        )}
      </div>

      {/* --- 3D CANVAS (Right) --- */}
      <div style={styles.canvas}>
        {graphData ? (
          <ForceGraph3D
            ref={fgRef}
            graphData={graphData}
            
            // Tree Layout
            dagMode="td" 
            dagLevelDistance={80}
            
            // ✨ NEW: Smart Text Logic (Name + Description)
            nodeThreeObject={node => {
              let label = node.name;
              
              // Agar description hai to usko brackets me add karo
              if (node.desc) {
                label += `\n(${node.desc})`; 
              }

              const sprite = new SpriteText(label);
              sprite.color = node.color; 
              sprite.textHeight = node.desc ? 5 : 6; // Agar desc hai to font thoda chota rakho
              sprite.padding = 3;
              sprite.backgroundColor = 'rgba(0,0,0,0.6)'; // Background thoda dark taaki text padha jaye
              sprite.borderRadius = 4;
              sprite.fontWeight = 'bold';
              return sprite;
            }}
            
            // Links
            linkColor={() => 'rgba(255,255,255,0.2)'}
            linkDirectionalParticles={2}
            
            // Background
            backgroundColor="#050505"
            
            // Fit View
            onEngineStop={() => fgRef.current.zoomToFit(400, 50)}
          />
        ) : (
          <div style={styles.placeholder}>
            <h1>Ready to Visualize Code?</h1>
            <p>Enter a GitHub URL on the left sidebar to start.</p>
          </div>
        )}
      </div>

    </div>
  );
}

// --- CSS STYLES (Same as before) ---
const styles = {
  container: { display: 'flex', height: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", overflow: 'hidden' },
  sidebar: { width: '300px', background: '#1a1a1a', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 10px rgba(0,0,0,0.5)', zIndex: 10 },
  canvas: { flex: 1, background: '#050505', position: 'relative' },
  inputGroup: { marginBottom: '15px' },
  input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#333', color: 'white', marginTop: '5px', boxSizing:'border-box' },
  button: { width: '100%', padding: '12px', borderRadius: '5px', border: 'none', background: '#007bff', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop:'10px' },
  legend: { background: '#222', padding: '10px', borderRadius: '5px' },
  legendItem: { display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '14px' },
  dot: { width: '12px', height: '12px', borderRadius: '50%', marginRight: '10px', display: 'block' },
  placeholder: { height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#555' }
};

export default App;