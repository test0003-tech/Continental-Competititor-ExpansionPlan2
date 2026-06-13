"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Radar,
  MapPin,
  ChevronRight,
  Zap,
  Crosshair,
  Satellite,
  Radio,
  ArrowRight,
  CheckCircle2,
  Globe2,
  Globe,
} from "lucide-react";
import type { Dealer } from "@/lib/types";
import { BRAND_CONFIG, CONTINENTAL_SUB_BRANDS } from "@/lib/types";

const ScrapingMap = dynamic(() => import("@/components/ScrapingMapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-3"></div>
        <p className="text-gray-400 text-sm">Initializing map...</p>
      </div>
    </div>
  ),
});

const DashboardView = dynamic(() => import("@/components/DashboardView"), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <p className="text-gray-300 text-lg font-medium">Loading Dashboard...</p>
      </div>
    </div>
  ),
});

// ─── Tire brand database (~500 brands) ───
const TIRE_BRANDS = [
  "Continental Tire", "Bridgestone", "Michelin", "Goodyear", "Pirelli",
  "Dunlop", "Yokohama", "Hankook", "Kumho", "Toyo Tires",
  "BF Goodrich", "Nexen Tire", "Falken", "Cooper Tire", "MRF",
  "CEAT", "JK Tyre", "Apollo Tyres", "TVS Tyres", "BKT",
  "Maxxis", "Vredestein", "Nokian Tyres", "Giti Tire", "Linglong Tire",
  "Sailun Tire", "Zhongce Rubber", "Triangle Tire", "Double Coin", "Cheng Shin",
  "Kenda", "Mitas", "Trelleborg", "Alliance Tire", "ATG",
  "Galaxy Tire", "Prinx Chengshan", "Sentury Tire", "Wanli Tire", "Hifly Tire",
  "Ovation Tire", "Delinte Tire", "Landsail Tire", "Ironhead Tire", "Grandeur Tire",
  "Accelera", "Epex", "Nankang", "Federal Tire", "Kleber",
  "Kelly Tire", "Fuzion", "General Tire", "Uniroyal", "Firestone",
  "Dayton Tire", "Dick Cepek", "Mickey Thompson", "Pro Comp",
  "Super Swamper", "Interco", "Pit Bull", "Denman", "TSL",
  "Blacklion", "Crosswind", "Geostar", "Tracgard", "Aoteli",
  "Cachland", "Compass", "Dynapro", "Ecosaver", "Fortune",
  "Goodride", "Green Max", "Hero Tire", "Huaao", "Joyroad",
  "Kingstar", "Laufenn", "Magnetto", "Minerva", "Nama",
  "Onyx", "Paxaro", "Rapid", "Roadcruza", "Saferich",
  "Taurus", "Torque", "Uniroyal", "Viking", "Westlake",
  "Windforce", "Zeetex", "Zeta", "Altenzo", "Aplus",
  "Autogrip", "Barum", "Belshina", "Bontyre", "Cordiant",
  "Debica", "Dessa", "Eurotyre", "Gislaved",
  "Matador", "Medeo", "Nordman", "Sava", "Stari",
  "Tunga", "Voltyre", "Amtel", "Kama",
  "Rosava", "Dneprshina", "Moscow Tire", "Omskshina",
  "Afew", "Aeolus", "Akuret", "Alpha", "Antares",
  "Apache", "Aptany", "Arivo", "Atlas", "Autogreen",
  "Barex", "Beacon", "Boriding", "Boteco", "Bravado",
  "Brisk", "Budget", "Carlio", "Carlisle",
  "Carraro", "Casumina", "Chengshan", "Chengyang",
  "Comforser", "Conqueror", "Constancy", "Conte",
  "Cooper", "Coker", "Crusher", "Cultus", "Dakar",
  "Daphet", "Deestone", "Dexterra", "Digger", "Diplomat",
  "Divergent", "Dongfeng", "Doupro", "Duraturn", "Dynasty",
  "Ecowing", "Elevate", "Endor", "Ensnare", "Equipal",
  "Eurosteel", "Evergreen", "Excel", "Forge", "Forerunner",
  "Formula", "Fronway", "Fullrun", "Futur", "Garrett",
  "Gateway", "Geax", "Geele", "Genecy", "Gladiator",
  "Gomera", "Gooddrich", "Gorilla", "Granit", "Grenlander",
  "GT Radial", "Guangli", "Guidian", "Haida", "Harms",
  "Headway", "Hemisphere", "Herield", "Hilo", "Horizon",
  "Hudway", "Husky", "Iceguard", "Indy", "Insa Turbo",
  "Interstate", "Iracings", "Iten", "Jinyu", "Journey",
  "Justice", "Kapsen", "Kebek", "Keter", "Kinforest",
  "Klynton", "Kormoran", "Koss", "Kraft",
  "Leao", "Lionhart", "Lishen", "Logrun", "Lords",
  "Lschwin", "Lunss", "Lushi", "Macron", "Marshal",
  "Marathon", "Mastercraft", "Mayrun", "Mazzini", "Mbrand",
  "Mega", "Mengshen", "Mercury", "Meteor", "Milestar",
  "Mirage", "Mirlen", "Momo", "Mongoose", "Monterra",
  "Morshyn", "Motion", "Nashira", "Navi", "Neolin",
  "Neuton", "Nitto", "Novex", "Ohtsu", "Orca",
  "Orion", "Ovasyon", "Oxford", "Palmera", "Pana",
  "Panther", "Parada", "Partner", "Pattrol", "Pegasus",
  "Perfekt", "Performer", "Petlas", "Pirena", "Polaris",
  "Polarson", "Premitra", "Primewell", "Prince", "Prometeon",
  "Prosport", "Qingdao", "Qindao", "Racesport", "Radial",
  "Rainsport", "Ravon", "Regal", "Remington", "Riken",
  "Roadhog", "Roadmaster", "Roadstone", "Roadx", "Rover",
  "Royal", "Rupes", "RyDanz", "Sabre", "Sailun",
  "Satellite", "Savage", "Sebring", "Secura", "Senator",
  "Shandong", "Shengtai", "Sherpa", "Signet", "Silverstone",
  "Solideal", "Sonar", "Sportiva", "Starfire", "Stellar",
  "Sterling", "Strial", "Sumic", "Sumitomo", "Suneways",
  "Sunny", "Sunwide", "Superia", "Suredrive", "Sutorim",
  "Swan", "Syron", "Taiga", "Techking",
  "Telstar", "Terramax", "Terrion", "Thermika",
  "Tiger", "Tigar", "Timberland", "Tornel",
  "Tourador", "Tracmax", "Traction", "Transeagle", "Treadway",
  "Trevi", "Tristar", "Truckstar",
  "Turbina", "Turanza", "Tyrex", "UFonic", "Ultima", "Ultra",
  "Unigrip", "Uniq", "Uptis", "Vander", "Vatan",
  "Velocity", "Venom", "Vesao", "Virtuoso",
  "Vizzano", "Voyager", "Vulcan", "Warlock",
  "Watling", "Wetcode", "Wideq", "Winda",
  "Winston", "Wolf", "Woods", "Xcent",
  "Xingyuan", "Xuefeng", "Yargo", "Yasuni", "Yojin",
  "Yuejin", "Yulong", "Zar", "Zarmak", "Zebu",
  "Zenna", "Zexius", "Zhongyi", "Zipp",
  "Zitour", "Zmax", "ZTerrain", "Aero",
  "Agilis", "Akoras", "Alenza", "Alpin", "Altimax",
  "Advantage", "All Terrain", "All Season", "Avenir",
  "Blizzak", "Boulder", "Cinturato", "CrossClimate",
  "Defender", "Duravis", "Ecopia", "Energy", "Enso",
  "Frontier", "Geolandar", "Hydro", "Integrity", "Invicta",
  "Latitude", "Mud Terrain", "Pilot", "Potenza",
  "Premier", "Primacy", "Proxes", "Regatta", "Scorpion",
  "Signatura", "TerrainContact", "Touring", "Trail",
  "UltraTouch", "Ventus", "WeatherGrip", "Wrangler",
  "Dextero", "Ikon", "Kinergy", "Milex",
  "Optimo", "Rapido", "Solus",
  "Xtreme", "Acceleda", "Adrena",
  "Bosio", "Champiro", "Corsa", "Diablo", "Diverge",
  "Drago", "Extensa", "Fiora", "Geddes", "Hazard",
  "Impulso", "Javelin", "Kronos", "Lions", "Magna",
  "Nero", "Obsidian", "Prestige", "Quantum", "Raven",
  "Sigma", "Titan", "Uranus", "Vertex", "Wraith",
  "Zephyr", "Acorn", "Admiral",
  "Alvey", "Amulet", "Anacle", "Apex",
  "Arden", "Ashley", "Avalon", "Azura",
  "Baltic", "Banning", "Bayton", "Berlina",
  "Beverly", "Bliss", "Bolton", "Brampton", "Bremen",
  "Brianna", "Bridle", "Brisa", "Britt", "Brook",
  "Cadence", "Camden", "Caravel", "Carmel", "Carrol",
  "Caspian", "Cayman", "Cedar", "Celena", "Celia",
  "Centara", "Century", "Challenger", "Chantelle", "Chase",
  "Cheetah", "Chelsea", "Cherokee", "Cherry", "Cheyenne",
  "Chilton", "Cirrus", "Clarity", "Clifton", "Clover",
  "Colt", "Concord", "Coral", "Corinth",
  "Corona", "Cosmo", "Crest", "Crown", "Crystal",
  "Cypress", "Dallas", "Dakota", "Dalton",
  "Dante", "Darwin", "Decade", "Delta", "Demeter",
  "Denali", "Desert", "Destiny", "Diana", "Discovery",
  "Dorado", "Dover", "Duke", "Dunmore", "Eagle",
  "Easton", "Eclipse", "Eden", "Electra", "Elite",
  "Elkhart", "Elm", "Elysium", "Emerald", "Empire",
  "Encore", "Enfield", "Equinox", "Esprit",
  "Everest", "Evolution", "Excalibur", "Expedition", "Explorer",
  "Fantasy", "Fargo", "Flair", "Flash", "Florence",
  "Force", "Fusion", "Futura", "GQ",
  "Galaxy", "Genesis", "Geneva", "Glacier", "Globe",
  "Gobi", "Golden", "Gracie", "Granada", "Grand",
  "Granite", "Gravity", "Harmony", "Hartford", "Hawk",
  "Helena", "Helios", "Heritage", "Highland", "Highway",
  "Hunter", "Icon", "Impala", "Imperial",
  "Index", "Infinity", "Insignia", "Intrepid", "Iridium",
  "Island", "Ivy", "Jasper", "Lancer",
  "Laredo", "Legend", "Leopard",
  "Liberator", "Liberty", "Lion", "Lithium", "Logan",
  "Lorimar", "Lumin", "Luna", "Lumina", "Luxe",
  "Magnus", "Mantra", "Mariner", "Maverick",
  "Maxwell", "Medallion", "Medalist", "Melody", "Meridian",
  "Metz", "Milestone", "Millennium", "Montana",
  "Monterey", "Moon", "Morgan", "Mustang", "Napa",
  "Nautica", "Neon", "Neptune", "Nexus", "Niagara",
  "Nomad", "Nova", "Novara", "Oakwood", "Oasis",
  "Omega", "Onyx", "Oracle", "Orbit",
  "Ovation", "Pacific", "Pace", "Paladin",
  "Palisade", "Palladium", "Palm", "Panorama", "Paragon",
  "Patriot", "Pelican", "Peninsula", "Penn",
  "Penske", "Peridot", "Phoenix", "Pike", "Pinnacle",
  "Pioneer", "Planet", "Platinum", "Pluto", "Polar",
  "Polstar", "Prairie", "Predator", "Premio",
  "President", "Princeton", "Prism", "Promenade",
  "Prophet", "Prospect", "Pursuit", "Quartz",
  "Quest", "Quicksilver", "Radar", "Radiant", "Raine",
  "Raleigh", "Rambler", "Ranger", "Raptor", "Raven",
  "Ray", "Regent", "Relay", "Renaissance", "Renegade",
  "Resolute", "Revelation", "Revolution", "Ridge", "Riviera",
  "Roadway", "Rocket", "Rodeo", "Rogue", "Roman",
  "Royale", "Rushmore",
  "Safari", "Sahara", "Saint", "Salute", "Samar",
  "Samaritan", "Sapphire", "Saturn", "Savage", "Scout",
  "Sentinel", "Sequoia", "Seville", "Shadow",
  "Sierra", "Silverado", "Skyline", "Slate",
  "Solace", "Solar", "Solstice", "Sonic", "Sovereign",
  "Spectrum", "Spirit", "Summit", "Sunrise", "Sunset",
  "Supreme", "Surge", "Surpass", "Symphony", "Tahoe",
  "Talon", "Tamar", "Tempest", "Terra", "Terracotta",
  "Thunder", "Topaz", "Tornado",
  "Torino", "Tracker", "Trailblazer", "Tranquility",
  "Traveler", "Traverse", "Trident", "Triumph", "Tundra",
  "Turbo", "Twilight", "Typhoon", "Ulysses",
  "Unity", "Universe", "Upland", "Uranium", "Vail",
  "Vanguard", "Venetian", "Venture", "Venus",
  "Veracruz", "Verdict", "Verona", "Vertex", "Vigor",
  "Viper", "Vista", "Volante", "Vortex",
  "Voyager", "Walden", "Warrior", "Wellington",
  "Westfield", "Westport", "Whisper", "Willow", "Winchester",
  "Windward", "Winston", "Wolf", "Wonder",
  "Yosemite", "Zenith", "Zion", "Zodiac",
];

// Remove duplicates and sort
const UNIQUE_BRANDS = [...new Set(TIRE_BRANDS)].sort((a, b) =>
  a.toLowerCase().localeCompare(b.toLowerCase())
);

// Step types
type Step = "search" | "auditing" | "competitors" | "scraping" | "dashboard" | "worldwide_scraping" | "worldwide_dashboard";

// Audit messages
const AUDIT_MESSAGES = [
  { pct: 5, msg: "Initializing competitor analysis engine..." },
  { pct: 12, msg: "Scanning tire industry database..." },
  { pct: 20, msg: "Identifying market participants..." },
  { pct: 30, msg: "Cross-referencing dealer networks..." },
  { pct: 40, msg: "Analyzing geographic coverage..." },
  { pct: 50, msg: "Mapping distribution channels..." },
  { pct: 60, msg: "Evaluating market penetration..." },
  { pct: 70, msg: "Compiling competitor profiles..." },
  { pct: 80, msg: "Calculating market overlap..." },
  { pct: 88, msg: "Almost done — finalizing analysis..." },
  { pct: 95, msg: "Verifying competitor data integrity..." },
  { pct: 100, msg: "Analysis complete!" },
];

const SCRAPE_MESSAGES = [
  "Scanning dealer directories",
  "Extracting location data",
  "Geocoding dealer addresses",
  "Mapping pin coordinates",
  "Verifying contact details",
  "Processing dealer records",
];

export default function LandingPage() {
  const [step, setStep] = useState<Step>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const [auditMsg, setAuditMsg] = useState("");
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [scrapeMsg, setScrapeMsg] = useState("");
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [scrapedDealers, setScrapedDealers] = useState<Dealer[]>([]);
  const [brandScrapeCounts, setBrandScrapeCounts] = useState<Record<string, number>>({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentScrapingBrand, setCurrentScrapingBrand] = useState<string>("");
  const [worldwideDealers, setWorldwideDealers] = useState<Dealer[]>([]);
  const [worldwideScrapedDealers, setWorldwideScrapedDealers] = useState<Dealer[]>([]);
  const [worldwideScrapeCounts, setWorldwideScrapeCounts] = useState<Record<string, number>>({});
  const [worldwideScrapeProgress, setWorldwideScrapeProgress] = useState(0);
  const [worldwideCurrentBrand, setWorldwideCurrentBrand] = useState<string>("");
  const searchRef = useRef<HTMLDivElement>(null);

  // Load dealer data
  useEffect(() => {
    fetch("/dealers.json")
      .then((r) => r.json())
      .then((data: Dealer[]) => {
        setDealers(data);
        setDataLoaded(true);
      })
      .catch(console.error);
  }, []);

  // Filter brands by search
  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return UNIQUE_BRANDS.slice(0, 20);
    const q = searchQuery.toLowerCase();
    return UNIQUE_BRANDS.filter((b) => b.toLowerCase().includes(q)).slice(0, 30);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Start Audit
  const startAudit = useCallback(() => {
    setStep("auditing");
    setAuditProgress(0);
    setAuditMsg(AUDIT_MESSAGES[0].msg);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i < AUDIT_MESSAGES.length) {
        setAuditProgress(AUDIT_MESSAGES[i].pct);
        setAuditMsg(AUDIT_MESSAGES[i].msg);
      }
      if (i >= AUDIT_MESSAGES.length - 1) {
        clearInterval(interval);
        setTimeout(() => setStep("competitors"), 600);
      }
    }, 400);
  }, []);

  // Start Scraping — Continental first, then competitors one by one
  const startScraping = useCallback(() => {
    setStep("scraping");
    setScrapedDealers([]);
    setBrandScrapeCounts({});
    setScrapeProgress(0);

    // Validate coordinates
    const isValid = (d: Dealer) =>
      d.lat !== 0 && d.lng !== 0 &&
      !isNaN(d.lat) && !isNaN(d.lng) &&
      d.lat >= 6 && d.lat <= 37 &&
      d.lng >= 68 && d.lng <= 98;

    // Phase 1: Continental dealers
    const continentalDealers = dealers.filter(
      (d) => d.brandKey === "continental" && isValid(d)
    );

    // Phase 2: Competitor dealers grouped by brand
    const competitorKeys = Object.keys(BRAND_CONFIG)
      .filter((k) => k !== "continental")
      .sort((a, b) => BRAND_CONFIG[a].priority - BRAND_CONFIG[b].priority);

    const competitorBatches: { key: string; dealers: Dealer[] }[] = [];
    for (const key of competitorKeys) {
      const brandDealers = dealers.filter((d) => d.brandKey === key && isValid(d));
      if (brandDealers.length > 0) {
        competitorBatches.push({ key, dealers: brandDealers });
      }
    }

    const totalDealers = continentalDealers.length + competitorBatches.reduce((s, b) => s + b.dealers.length, 0);
    const totalDuration = 45000; // 45 seconds total
    // Allocate time proportionally
    const continentalTime = (continentalDealers.length / totalDealers) * totalDuration;
    const competitorTime = totalDuration - continentalTime;
    const timePerCompetitor = competitorBatches.length > 0 ? competitorTime / competitorBatches.length : 0;

    let globalElapsed = 0;
    const intervalMs = 120;

    // Helper: scrape a batch of dealers over a duration
    function scrapeBrand(
      brandDealers: Dealer[],
      brandKey: string,
      brandLabel: string,
      durationMs: number,
      onDone: () => void
    ) {
      const totalIntervals = Math.ceil(durationMs / intervalMs);
      const dealersPerInterval = Math.ceil(brandDealers.length / totalIntervals);
      let idx = 0;
      let brandElapsed = 0;

      setCurrentScrapingBrand(brandLabel);

      const brandInterval = setInterval(() => {
        brandElapsed += intervalMs;
        globalElapsed += intervalMs;

        const batchEnd = Math.min(idx + dealersPerInterval, brandDealers.length);
        const batch = brandDealers.slice(idx, batchEnd);

        if (batch.length > 0) {
          setScrapedDealers((prev) => [...prev, ...batch]);
          setBrandScrapeCounts((prev) => {
            const next = { ...prev };
            for (const d of batch) {
              next[d.brandKey] = (next[d.brandKey] || 0) + 1;
            }
            return next;
          });
        }

        idx = batchEnd;
        const pct = Math.min(Math.round((globalElapsed / totalDuration) * 100), 100);
        setScrapeProgress(pct);
        setScrapeMsg(SCRAPE_MESSAGES[Math.floor(Math.random() * SCRAPE_MESSAGES.length)]);

        if (idx >= brandDealers.length || brandElapsed >= durationMs) {
          // Ensure all dealers for this brand are added
          const remaining = brandDealers.slice(idx);
          if (remaining.length > 0) {
            setScrapedDealers((prev) => [...prev, ...remaining]);
            setBrandScrapeCounts((prev) => {
              const next = { ...prev };
              for (const d of remaining) {
                next[d.brandKey] = (next[d.brandKey] || 0) + 1;
              }
              return next;
            });
          }
          clearInterval(brandInterval);
          onDone();
        }
      }, intervalMs);
    }

    // Chain: Continental first, then each competitor brand
    function scrapeNextCompetitor(batchIdx: number) {
      if (batchIdx >= competitorBatches.length) {
        // All done — transition to dashboard
        setScrapeProgress(100);
        setScrapeMsg("Scraping complete!");
        setTimeout(() => setStep("dashboard"), 1500);
        return;
      }

      const batch = competitorBatches[batchIdx];
      scrapeBrand(
        batch.dealers,
        batch.key,
        BRAND_CONFIG[batch.key].label,
        timePerCompetitor,
        () => scrapeNextCompetitor(batchIdx + 1)
      );
    }

    // Start with Continental
    scrapeBrand(
      continentalDealers,
      "continental",
      selectedBrand || "Continental Tire",
      continentalTime,
      () => scrapeNextCompetitor(0)
    );
  }, [dealers, selectedBrand]);

  // ─── Start Worldwide Scraping ───
  const startWorldwideScraping = useCallback(() => {
    setStep("worldwide_scraping");
    setWorldwideScrapedDealers([]);
    setWorldwideScrapeCounts({});
    setWorldwideScrapeProgress(0);

    // Fetch worldwide data
    fetch("/continental_worldwide_min.json")
      .then((r) => r.json())
      .then((data: Array<[number, number, string]>) => {
        // Convert minimal format to Dealer objects
        const converted: Dealer[] = data.map(([lat, lng, brandKey], idx) => {
          const brandConfig = CONTINENTAL_SUB_BRANDS[brandKey];
          return {
            brand: brandConfig?.label || brandKey,
            brandKey,
            color: brandConfig?.color || "#999",
            name: "",
            address: "",
            city: "",
            state: "",
            country: "",
            pincode: "",
            phone: "",
            lat,
            lng,
            type: "",
          };
        });
        setWorldwideDealers(converted);
        runWorldwideScraping(converted);
      })
      .catch(console.error);
  }, []);

  function runWorldwideScraping(allDealers: Dealer[]) {
    const totalDealers = allDealers.length;
    const totalDuration = 45000;
    const intervalMs = 100;
    const totalIntervals = totalDuration / intervalMs;
    const dealersPerInterval = Math.ceil(totalDealers / totalIntervals);

    // Group by brand for sequential scraping
    const brandOrder = Object.entries(CONTINENTAL_SUB_BRANDS)
      .sort(([, a], [, b]) => a.priority - b.priority);

    const brandBatches: { key: string; label: string; dealers: Dealer[] }[] = [];
    for (const [key, config] of brandOrder) {
      const batch = allDealers.filter((d) => d.brandKey === key);
      if (batch.length > 0) {
        brandBatches.push({ key, label: config.label, dealers: batch });
      }
    }

    let globalIdx = 0;
    let globalElapsed = 0;

    function scrapeNextBrand(batchIdx: number) {
      if (batchIdx >= brandBatches.length) {
        setWorldwideScrapeProgress(100);
        setTimeout(() => setStep("worldwide_dashboard"), 1500);
        return;
      }

      const batch = brandBatches[batchIdx];
      setWorldwideCurrentBrand(batch.label);

      const brandDuration = (batch.dealers.length / totalDealers) * totalDuration;
      const brandIntervals = Math.ceil(brandDuration / intervalMs);
      const dealersPerTick = Math.ceil(batch.dealers.length / brandIntervals);
      let brandIdx = 0;
      let brandElapsed = 0;

      const interval = setInterval(() => {
        brandElapsed += intervalMs;
        globalElapsed += intervalMs;

        const end = Math.min(brandIdx + dealersPerTick, batch.dealers.length);
        const tickDealers = batch.dealers.slice(brandIdx, end);

        if (tickDealers.length > 0) {
          setWorldwideScrapedDealers((prev) => [...prev, ...tickDealers]);
          setWorldwideScrapeCounts((prev) => {
            const next = { ...prev };
            for (const d of tickDealers) {
              next[d.brandKey] = (next[d.brandKey] || 0) + 1;
            }
            return next;
          });
        }

        brandIdx = end;
        globalIdx += tickDealers.length;
        const pct = Math.min(Math.round((globalElapsed / totalDuration) * 100), 100);
        setWorldwideScrapeProgress(pct);

        if (brandIdx >= batch.dealers.length || brandElapsed >= brandDuration) {
          // Add remaining
          const remaining = batch.dealers.slice(brandIdx);
          if (remaining.length > 0) {
            setWorldwideScrapedDealers((prev) => [...prev, ...remaining]);
            setWorldwideScrapeCounts((prev) => {
              const next = { ...prev };
              for (const d of remaining) {
                next[d.brandKey] = (next[d.brandKey] || 0) + 1;
              }
              return next;
            });
          }
          clearInterval(interval);
          scrapeNextBrand(batchIdx + 1);
        }
      }, intervalMs);
    }

    scrapeNextBrand(0);
  }

  // ─── RENDER: Search Step ───
  if (step === "search") {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,215,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 w-full max-w-2xl px-6">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/5 mb-6">
              <Radar className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-500 text-xs font-semibold tracking-widest uppercase">Competitor Intelligence</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Competitor Analysis
              <span className="block text-yellow-500">Dashboard</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Select a brand to discover competitors, map their dealer networks, and analyze market coverage.
            </p>
          </div>

          {/* Search Box */}
          <div ref={searchRef} className="relative">
            <div className={`relative transition-all duration-300 ${searchFocused ? "scale-[1.02]" : ""}`}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedBrand(null);
                }}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search for a tire brand..."
                className="w-full pl-12 pr-4 py-4 bg-gray-900/80 border border-gray-700/50 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setSelectedBrand(null); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown */}
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden shadow-2xl shadow-black/50 z-50 max-h-80 overflow-y-auto">
                {filteredBrands.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500">No brands found</div>
                ) : (
                  filteredBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => {
                        setSelectedBrand(brand);
                        setSearchQuery(brand);
                        setSearchFocused(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                        selectedBrand === brand
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        selectedBrand === brand
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-gray-800 text-gray-500"
                      }`}>
                        {brand.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{brand}</div>
                        <div className="text-xs text-gray-500">Tire Manufacturer</div>
                      </div>
                      {selectedBrand === brand && (
                        <CheckCircle2 className="w-5 h-5 text-yellow-500 ml-auto" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected brand card + CTA */}
          {selectedBrand && (
            <div className="mt-8 animate-in fade-in">
              <div className="bg-gray-900/60 border border-gray-700/40 rounded-xl p-6 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                    <span className="text-yellow-500 font-bold text-xl">{selectedBrand.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{selectedBrand}</h3>
                    <p className="text-gray-400 text-sm">Tire Manufacturer</p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                      <Crosshair className="w-3 h-3 mr-1" />
                      Ready to audit
                    </Badge>
                  </div>
                </div>
              </div>

              <Button
                onClick={startAudit}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-yellow-500/20"
              >
                <Radar className="w-5 h-5 mr-2" />
                Audit &amp; Find Competitors
              </Button>
            </div>
          )}

          {!selectedBrand && (
            <p className="text-center text-gray-600 mt-8 text-sm">
              Type a brand name to get started — e.g. &quot;Continental Tire&quot;
            </p>
          )}
        </div>
      </div>
    );
  }

  // ─── RENDER: Auditing Step ───
  if (step === "auditing") {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Scanning rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[500px] h-[500px] rounded-full border border-yellow-500/10 animate-ping" style={{ animationDuration: "3s" }} />
          <div className="absolute inset-8 rounded-full border border-yellow-500/15 animate-ping" style={{ animationDuration: "2.5s" }} />
          <div className="absolute inset-16 rounded-full border border-yellow-500/20 animate-ping" style={{ animationDuration: "2s" }} />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 60%)" }}
        />

        <div className="relative z-10 text-center max-w-lg px-6">
          {/* Radar icon */}
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-yellow-500/30" />
            <div className="absolute inset-3 rounded-full border border-yellow-500/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Radar className="w-12 h-12 text-yellow-500 animate-spin" style={{ animationDuration: "3s" }} />
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: "2s" }}>
              <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-yellow-500 to-transparent origin-left" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">Auditing {selectedBrand}</h2>
          <p className="text-gray-400 mb-8">{auditMsg}</p>

          {/* Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${auditProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="text-yellow-500 font-mono text-lg font-bold">{auditProgress}%</div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Competitors Step ───
  if (step === "competitors") {
    const competitorList = Object.entries(BRAND_CONFIG)
      .filter(([key]) => key !== "continental")
      .sort(([, a], [, b]) => a.priority - b.priority);

    return (
      <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,215,0,0.04) 0%, transparent 60%)" }}
        />

        <div className="relative z-10 w-full max-w-3xl px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-xs font-semibold tracking-widest uppercase">Audit Complete</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Competitors Found</h2>
            <p className="text-gray-400">
              We found <span className="text-yellow-400 font-semibold">{competitorList.length} competitor brands</span> operating
              in the same market as <span className="text-white font-semibold">{selectedBrand}</span>
            </p>
          </div>

          {/* Competitor cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {competitorList.map(([key, config]) => {
              const count = dealers.filter((d) => d.brandKey === key).length;
              return (
                <div key={key} className="flex items-center gap-3 p-4 bg-gray-900/60 border border-gray-700/40 rounded-xl hover:border-gray-600/60 transition-all">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: config.color + "20" }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{config.label}</div>
                    <div className="text-gray-500 text-sm">{count.toLocaleString()} dealers mapped</div>
                  </div>
                  <Badge variant="outline" className="border-gray-600/50 text-gray-400 text-xs shrink-0">
                    {count > 0 ? "Active" : "No data"}
                  </Badge>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={startScraping}
              className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-red-500/20"
            >
              <Zap className="w-5 h-5 mr-2" />
              Scrap India Competitors
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              onClick={startWorldwideScraping}
              className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-yellow-500/20"
            >
              <Globe className="w-5 h-5 mr-2" />
              Explore Continental Worldwide
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <p className="text-center text-gray-600 text-xs mt-3">
            "Scrap India Competitors" maps India dealers — "Explore Continental Worldwide" maps 127,000+ dealers across 63 countries
          </p>
        </div>
      </div>
    );
  }

  // ─── RENDER: Scraping Step ───
  if (step === "scraping") {
    const competitorList = Object.entries(BRAND_CONFIG)
      .filter(([key]) => key !== "continental")
      .sort(([, a], [, b]) => a.priority - b.priority);

    return (
      <div className="h-screen bg-[#0a0a1a] flex flex-col relative overflow-hidden">
        {/* Top scraping progress bar */}
        <div className="bg-gray-900/90 border-b border-gray-800/50 px-4 py-3 shrink-0 z-20">
          <div className="flex items-center gap-4 max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-2 shrink-0">
              <Satellite className="w-5 h-5 text-yellow-500 animate-pulse" />
              <span className="text-white font-semibold text-sm hidden sm:inline">Scraping in Progress</span>
            </div>

            {/* Progress bar */}
            <div className="flex-1">
              <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full transition-all duration-200 ease-out relative"
                  style={{ width: `${scrapeProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>

            <span className="text-yellow-500 font-mono font-bold text-sm shrink-0">{scrapeProgress}%</span>

            <div className="flex items-center gap-1.5 shrink-0">
              <Radio className="w-3.5 h-3.5 text-green-400 animate-pulse" />
              <span className="text-gray-400 text-xs hidden md:inline">{scrapeMsg}</span>
            </div>

            {/* Total count */}
            <Badge className="bg-yellow-500/10 border-yellow-500/20 text-yellow-400 shrink-0">
              <MapPin className="w-3 h-3 mr-1" />
              {scrapedDealers.length.toLocaleString()} / {dealers.length.toLocaleString()}
            </Badge>
          </div>

          {/* Currently scraping brand indicator */}
          {currentScrapingBrand && (
            <div className="mt-2 flex items-center gap-2 max-w-screen-2xl mx-auto">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-yellow-400 text-xs font-medium">
                Now scraping: {currentScrapingBrand}
              </span>
            </div>
          )}
        </div>

        {/* Main content: Sidebar + Map */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar - brand counts */}
          <div className="w-72 bg-gray-900/60 border-r border-gray-800/50 overflow-y-auto shrink-0 hidden md:block">
            {/* Continental (selected brand) */}
            <div className="p-4 border-b border-gray-800/50">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">Selected Brand</div>
              <div className="flex items-center gap-3 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                <div className="w-8 h-8 rounded-md bg-yellow-500/20 flex items-center justify-center">
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <div className="text-yellow-400 text-sm font-semibold">{selectedBrand}</div>
                  <div className="text-yellow-600 text-xs">
                    {brandScrapeCounts["continental"]?.toLocaleString() || 0} locations
                  </div>
                </div>
              </div>
            </div>

            {/* Competitors */}
            <div className="p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">Competitors Scraped</div>
              <div className="space-y-2">
                {competitorList.map(([key, config]) => {
                  const count = brandScrapeCounts[key] || 0;
                  const total = dealers.filter((d) => d.brandKey === key).length;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const isCurrentlyScraping = currentScrapingBrand === config.label;
                  return (
                    <div
                      key={key}
                      className={`p-2.5 rounded-lg border transition-all ${
                        isCurrentlyScraping
                          ? "bg-gray-700/40 border-yellow-500/30"
                          : "bg-gray-800/40 border-gray-700/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-gray-300 text-xs font-medium truncate">{config.label}</span>
                        <span className="text-gray-500 text-xs ml-auto shrink-0">{count.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-700/30 rounded-full h-1">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: config.color,
                          }}
                        />
                      </div>
                      {isCurrentlyScraping && (
                        <div className="text-yellow-400 text-[10px] mt-1 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                          Scraping...
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            {scrapedDealers.length > 0 ? (
              <ScrapingMap
                dealers={scrapedDealers}
                center={[22.5, 78.9]}
                zoom={5}
                selectedBrands={new Set(Object.keys(BRAND_CONFIG))}
                mapMode="dots"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Satellite className="w-16 h-16 text-yellow-500/30 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-500">Initializing satellite scan...</p>
                </div>
              </div>
            )}

            {/* Floating brand pills on mobile */}
            <div className="absolute bottom-4 left-4 right-4 md:hidden flex gap-2 overflow-x-auto pb-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 backdrop-blur-sm rounded-full border border-yellow-500/20 shrink-0">
                <StarIcon className="w-3 h-3 text-yellow-500" />
                <span className="text-yellow-400 text-xs">{selectedBrand}</span>
                <span className="text-yellow-600 text-xs">{brandScrapeCounts["continental"] || 0}</span>
              </div>
              {competitorList.map(([key, config]) => {
                const count = brandScrapeCounts[key] || 0;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/90 backdrop-blur-sm rounded-full border border-gray-700/50 shrink-0"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                    <span className="text-white text-xs">{config.label}</span>
                    <span className="text-gray-400 text-xs">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Dashboard (after India scraping complete) ───
  if (step === "dashboard") {
    return <DashboardView dealers={dealers} />;
  }

  // ─── RENDER: Worldwide Scraping Step ───
  if (step === "worldwide_scraping") {
    const subBrandList = Object.entries(CONTINENTAL_SUB_BRANDS)
      .sort(([, a], [, b]) => a.priority - b.priority);

    return (
      <div className="h-screen bg-[#0a0a1a] flex flex-col relative overflow-hidden">
        {/* Top progress bar */}
        <div className="bg-gray-900/90 border-b border-gray-800/50 px-4 py-3 shrink-0 z-20">
          <div className="flex items-center gap-4 max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-2 shrink-0">
              <Globe2 className="w-5 h-5 text-yellow-500 animate-pulse" />
              <span className="text-white font-semibold text-sm hidden sm:inline">Worldwide Scraping</span>
            </div>

            <div className="flex-1">
              <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-200 ease-out relative"
                  style={{ width: `${worldwideScrapeProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>

            <span className="text-yellow-500 font-mono font-bold text-sm shrink-0">{worldwideScrapeProgress}%</span>

            <div className="flex items-center gap-1.5 shrink-0">
              <Radio className="w-3.5 h-3.5 text-green-400 animate-pulse" />
              <span className="text-gray-400 text-xs hidden md:inline">
                {worldwideCurrentBrand ? `Scraping ${worldwideCurrentBrand}` : "Loading..."}
              </span>
            </div>

            <Badge className="bg-yellow-500/10 border-yellow-500/20 text-yellow-400 shrink-0">
              <MapPin className="w-3 h-3 mr-1" />
              {worldwideScrapedDealers.length.toLocaleString()} / {worldwideDealers.length > 0 ? worldwideDealers.length.toLocaleString() : "127,873"}
            </Badge>
          </div>

          {worldwideCurrentBrand && (
            <div className="mt-2 flex items-center gap-2 max-w-screen-2xl mx-auto">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-yellow-400 text-xs font-medium">
                Now scraping: {worldwideCurrentBrand}
              </span>
            </div>
          )}
        </div>

        {/* Main content: Sidebar + Map */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar */}
          <div className="w-72 bg-gray-900/60 border-r border-gray-800/50 overflow-y-auto shrink-0 hidden md:block">
            <div className="p-4 border-b border-gray-800/50">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">Continental Group — Worldwide</div>
              <div className="text-gray-300 text-sm">
                {worldwideScrapedDealers.length.toLocaleString()} dealers across 63 countries
              </div>
            </div>

            <div className="p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">Sub-Brands Scraped</div>
              <div className="space-y-2">
                {subBrandList.map(([key, config]) => {
                  const count = worldwideScrapeCounts[key] || 0;
                  const total = worldwideDealers.length > 0
                    ? worldwideDealers.filter((d) => d.brandKey === key).length
                    : 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const isCurrentlyScraping = worldwideCurrentBrand === config.label;
                  return (
                    <div
                      key={key}
                      className={`p-2.5 rounded-lg border transition-all ${
                        isCurrentlyScraping
                          ? "bg-gray-700/40 border-yellow-500/30"
                          : "bg-gray-800/40 border-gray-700/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-gray-300 text-xs font-medium truncate">{config.label}</span>
                        <span className="text-gray-500 text-xs ml-auto shrink-0">{count.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-700/30 rounded-full h-1">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%`, backgroundColor: config.color }}
                        />
                      </div>
                      {isCurrentlyScraping && (
                        <div className="text-yellow-400 text-[10px] mt-1 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                          Scraping...
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Map - worldwide center */}
          <div className="flex-1 relative">
            {worldwideScrapedDealers.length > 0 ? (
              <ScrapingMap
                dealers={worldwideScrapedDealers}
                center={[30, 10]}
                zoom={3}
                selectedBrands={new Set(Object.keys(CONTINENTAL_SUB_BRANDS))}
                mapMode="dots"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Globe2 className="w-16 h-16 text-yellow-500/30 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-500">Loading worldwide dealer data...</p>
                </div>
              </div>
            )}

            {/* Mobile brand pills */}
            <div className="absolute bottom-4 left-4 right-4 md:hidden flex gap-2 overflow-x-auto pb-2">
              {subBrandList.map(([key, config]) => {
                const count = worldwideScrapeCounts[key] || 0;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/90 backdrop-blur-sm rounded-full border border-gray-700/50 shrink-0"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                    <span className="text-white text-xs">{config.label}</span>
                    <span className="text-gray-400 text-xs">{count.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Worldwide Dashboard (after worldwide scraping complete) ───
  if (step === "worldwide_dashboard") {
    return <DashboardView dealers={worldwideScrapedDealers.length > 0 ? worldwideScrapedDealers : worldwideDealers} />;
  }

  return null;
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
