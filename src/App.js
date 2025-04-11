
import './App.css';
import {useState} from 'react';


const bmEndpoint = "http://geocoding.geo.census.gov/geocoder/benchmarks";
const onelineaddress = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?"

function Gmap({ src }) {
  //Component responsible for rendering the Google map. It receives the src for the google map iframe as its input
  let borderSize = 0
  return (
    <div id="mapContainer">
            <iframe
                title="Google Map Render"
                id="gmap"
                width="450"
                height="250"
                src={src}
                frameborder="0" 
                style={ {border: borderSize} }
                referrerpolicy="no-referrer-when-downgrade"
                allowfullscreen>
            </iframe>
        </div>
  )
}

function RevisedAddress({ benchmarkId, userAddress, goBack }) {
  //Component responsible for rendering the formatted address and the lat lon
  //This component will also render the go back button as well as the Gmap component
  //The go back button works by calling a function that is passed to this component by its parent component Location Input
  //In LocationInput the goBack attribute of the RevisedAddress component is passed a function that resets the state of LocationInput
  //Because LocationInput only renders the RevisedAddress when its state permits, resetting that state causes the Revised Address component 
  //to not be rendered
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState(""); //defining state with the useState hook
  const [fmtAddr, setFmtAddr] = useState("");

  console.log(benchmarkId)
  const getRevisedAddr = async () => {
    if (fmtAddr === "") {
      const params = new URLSearchParams({address: userAddress, benchmark: benchmarkId, format:"json"}).toString()
      const opts = {method: 'GET'};
      const addrJson = await (await fetch(`${onelineaddress+params}`, opts)).json()
      setLat(addrJson.result.addressMatches[0].coordinates.x);
      setLon(addrJson.result.addressMatches[0].coordinates.y);
      setFmtAddr(addrJson.result.addressMatches[0].matchedAddress);
    }
  }
  getRevisedAddr();
  if (fmtAddr !== "") {
    const gmapOpts = new URLSearchParams({q:fmtAddr, center:`${lon},${lat}`}).toString();
    const gmapSrc = "https://www.google.com/maps/embed/v1/place?key=AIzaSyAyvWMWA82-To-mOGv_oacqD0osXq-Rqfo&" + gmapOpts;
    return ( // here is what the component will render
      <div>
        <br/><br/>
        <input type='button' value='Go Back' onClick={goBack}/>
        <p><b>Matched Address:</b> {fmtAddr} </p><p><b>Latitude:</b> {lat} Longitude: {lon}</p>
        <Gmap src={gmapSrc}/>
      </div>
    );
  }
}


function LocationInput() {
  const [bms, setBms] = useState([]);
  const [usrAddr, setUserAddr] = useState("");
  const [showResults, setShowResults] = useState(false); 
  const [selectedBm, setSelectedBm] = useState("")
  
  const getBms = async () => {
    if (bms.length === 0){
      const opts = {method: 'GET'}
      const benchmarks = await (await fetch(`${bmEndpoint}`,opts)).json()
      setBms(benchmarks.benchmarks)
    }
  }
  if (bms.length === 0) {
    getBms()
  }
  let unsetShowResults = () => {
    setShowResults(false);
  }
  const input_width = 250
  const input_height = 30
  const button_height = 30
  const button_width = 80
  const button_margin_l = 25

  let selectBm = (bmVal) => {
    console.log(bmVal);
    console.log(bms.length)
    setSelectedBm(bmVal);
  }

  if (bms.length === 0)
  {
    return (
      <div>
        <h1>Find My Location</h1>
        <p>Below, enter your full street address, including your city, state and zip code.</p>
        <input id="addr" type="text" placeholder="Enter your full address" style={{width: input_width + 'px',height: input_height + 'px'}}/>
        <br/>
        <p>Choose a Census Bureau address data source:</p>
        <select id="addressSources" style={{width: input_width + 'px',height: input_height + 'px'}}>
        
            <option>Loading...</option>
        </select>
        <input type="button" 
               value="Submit" 
               id="submitAddr" style={{width: button_width + 'px', height: button_height + 'px', marginLeft: button_margin_l + 'px'}}/>
      </div>
    )
  }
  else {
    
    const bmOpts = bms.map((bmEndpoint, i) => {
      return (<option key={i} value={bmEndpoint.id}>{bmEndpoint.benchmarkName}</option>);
    });
    return (
        <div>
          <h1>Find My Location</h1>
          <p>Below, enter your full street address, including your city, state and zip code.</p>
          <input id="addr" 
                 type="text" 
                 onChange = {e => setUserAddr(e.target.value)}
                 placeholder="Enter your full address" 
                 style={{width: input_width + 'px',height: input_height + 'px'}}/>
          <br/>
          <p>Choose a Census Bureau address data source:</p>
          <select id="addressSources" 
                value={selectedBm ? selectedBm : selectBm(bms[0].id)}
                onChange={e => selectBm(e.target.value)}
                style={{width: input_width + 'px',height: input_height + 'px'}}>
              {bmOpts}
          </select>
          <input type="button" 
                 value="Submit" 
                 id="submitAddr" 
                 onClick={() => setShowResults(true)}
                 style={{width: button_width + 'px', height: button_height + 'px', marginLeft: button_margin_l + 'px'}}/>
        
        {showResults && (<RevisedAddress benchmarkId={selectedBm} userAddress={usrAddr} goBack={() => unsetShowResults()}/>)}
        </div>
        
    )
  }
}

function App() {
  return (
    <LocationInput />
  );
}

export default App;

