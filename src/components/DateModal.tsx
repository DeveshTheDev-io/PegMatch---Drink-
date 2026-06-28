import { useState, useEffect } from "react";
import { X, Calendar, MapPin, Wine, Send, Loader2, Shield, Copy, Check } from "lucide-react";
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface Props {
  matchUser: any;
  onClose: () => void;
  onSend: (invite: { time: string; location: string; drinkStyle: string }) => void;
}

const DRINK_STYLES = [
  "Casual Beers",
  "Cocktails & Conversations",
  "Single Malt Tasting",
  "Wine Pairing",
  "Coffee & Mocktails"
];

function DateModalContent({ matchUser, onClose, onSend }: Props) {
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [drinkStyle, setDrinkStyle] = useState(DRINK_STYLES[0]);
  
  const [showSafety, setShowSafety] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const placesLib = useMapsLibrary('places');
  const [places, setPlaces] = useState<google.maps.places.Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  useEffect(() => {
    if (!placesLib) return;

    const fetchPlaces = async () => {
      setLoadingPlaces(true);
      try {
        // Try to get user location
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const center = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            
            const { places } = await placesLib.Place.searchNearby({
              locationRestriction: { center, radius: 5000 },
              includedPrimaryTypes: ['bar'],
              fields: ['displayName', 'formattedAddress'],
              maxResultCount: 8,
            });
            setPlaces(places || []);
            if (places && places.length > 0) {
              setLocation(places[0].displayName);
            }
            setLoadingPlaces(false);
          },
          async (err) => {
            console.warn("Geolocation denied/failed. Falling back to text search.", err);
            // Fallback if no location
            const { places } = await placesLib.Place.searchByText({
              textQuery: 'Speakeasy or Craft Bar in India',
              fields: ['displayName', 'formattedAddress'],
              maxResultCount: 8,
            });
            setPlaces(places || []);
            if (places && places.length > 0) {
              setLocation(places[0].displayName);
            }
            setLoadingPlaces(false);
          }
        );
      } catch (err) {
        console.error("Error fetching places", err);
        setLoadingPlaces(false);
      }
    };
    
    fetchPlaces();
  }, [placesLib]);

  const handleSend = () => {
    if (!time || !location) return;
    onSend({ time, location, drinkStyle });
  };

  const generateSafetyText = () => {
    const dateFormatted = time ? new Date(time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '[Time]';
    const locName = location || '[Location]';
    return `Hey! Just letting you know I'm going on a date with ${matchUser.user.displayName}. We're meeting at ${locName} on ${dateFormatted}. I'll check in with you later!`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateSafetyText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0A0A0C] border border-white/10 w-full max-w-sm rounded-[32px] overflow-hidden relative flex flex-col max-h-[90vh]">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-amber-500/10 blur-[50px] pointer-events-none" />
      
      <div className="p-6 pb-4 border-b border-white/10 flex justify-between items-center relative z-10 shrink-0">
        <h2 className="text-2xl font-black text-white">Plan a Date</h2>
        <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="p-6 space-y-6 relative z-10 overflow-y-auto">
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
          <img src={matchUser.user.photoURL} alt="Match" className="w-12 h-12 rounded-full object-cover border border-white/20" />
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Inviting</p>
            <p className="text-lg font-bold text-white">{matchUser.user.displayName}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-bold mb-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Date & Time
            </label>
            <input 
              type="datetime-local" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-slate-100 text-sm"
            />
          </div>
          
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-bold mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location (Craft Bars & Speakeasies)
            </label>
            {loadingPlaces ? (
              <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-400 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Locating best spots...
              </div>
            ) : (
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-slate-100 text-sm appearance-none"
              >
                {places.map(loc => <option key={loc.id} value={loc.displayName} className="bg-slate-900">{loc.displayName} - {loc.formattedAddress}</option>)}
                {places.length === 0 && <option className="bg-slate-900" disabled>No places found</option>}
              </select>
            )}
          </div>
          
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-bold mb-2 flex items-center gap-1">
              <Wine className="w-3 h-3" /> Drink Style
            </label>
            <select 
              value={drinkStyle}
              onChange={(e) => setDrinkStyle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-slate-100 text-sm appearance-none"
            >
              {DRINK_STYLES.map(style => <option key={style} value={style} className="bg-slate-900">{style}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button 
              onClick={() => setShowSafety(!showSafety)}
              className={`flex-1 border py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${showSafety ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
            >
              <Shield className={`w-5 h-5 ${showSafety ? 'text-emerald-500' : 'text-emerald-500'}`} /> Safety
            </button>
            
            <button 
              onClick={handleSend}
              disabled={!time || !location}
              className="flex-[2] bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Send className="w-5 h-5" /> Send Invite
            </button>
          </div>

          {showSafety && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
              <h3 className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Share with a friend
              </h3>
              <div className="bg-black/40 p-3 rounded-xl relative group">
                <p className="text-sm text-slate-300 pr-8 leading-relaxed">{generateSafetyText()}</p>
                <button 
                  onClick={handleCopy}
                  className="absolute top-2 right-2 p-2 bg-white/5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DateModal(props: Props) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
      {!hasValidKey ? (
        <div className="bg-[#0A0A0C] border border-white/10 w-full max-w-sm rounded-[32px] p-8 text-center relative overflow-hidden">
          <button onClick={props.onClose} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10">
            <X className="w-4 h-4 text-slate-400" />
          </button>
          <MapPin className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-4">Google Maps API Key Required</h2>
          <div className="text-sm text-slate-300 space-y-4 text-left bg-white/5 p-4 rounded-xl">
            <p><strong>1.</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener" className="text-amber-500 hover:underline">Get an API Key</a></p>
            <p><strong>2.</strong> Add your key as a secret:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Open <strong>Settings</strong> (⚙️)</li>
              <li>Select <strong>Secrets</strong></li>
              <li>Type <code>GOOGLE_MAPS_PLATFORM_KEY</code></li>
              <li>Paste your API key</li>
            </ul>
          </div>
        </div>
      ) : (
        <APIProvider apiKey={API_KEY} version="weekly">
          <DateModalContent {...props} />
        </APIProvider>
      )}
    </div>
  );
}
