const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PW = process.env.ADMIN_PASSWORD || 'coach2025!';

app.use(bodyParser.json());
app.use('/api', express.static(path.join(__dirname, 'api')));
app.get('/', (req,res)=>res.sendFile(path.join(__dirname,'playbook.html')));
app.get('/playbook.html',(req,res)=>res.sendFile(path.join(__dirname,'playbook.html')));

const playsFile = path.join(__dirname,'api','plays.json');
if(!fs.existsSync(playsFile)) fs.writeFileSync(playsFile,'[]');

// API
app.get('/api/plays',(req,res)=>{
  const plays = JSON.parse(fs.readFileSync(playsFile));
  res.json(plays);
});

app.post('/api/plays',(req,res)=>{
  const { password, title, desc, cat, srcType, src } = req.body;
  if(password!==ADMIN_PW) return res.status(401).json({error:'Unauthorized'});
  const plays = JSON.parse(fs.readFileSync(playsFile));
  plays.push({ title, desc, cat, srcType, src });
  fs.writeFileSync(playsFile,JSON.stringify(plays,null,2));
  res.json({success:true});
});

app.delete('/api/plays/:id',(req,res)=>{
  const { password } = req.body;
  if(password!==ADMIN_PW) return res.status(401).json({error:'Unauthorized'});
  const id = parseInt(req.params.id);
  const plays = JSON.parse(fs.readFileSync(playsFile));
  if(id<0||id>=plays.length) return res.status(400).json({error:'Invalid ID'});
  plays.splice(id,1);
  fs.writeFileSync(playsFile,JSON.stringify(plays,null,2));
  res.json({success:true});
});

app.listen(PORT,()=>console.log(`Server läuft auf Port ${PORT}`));
