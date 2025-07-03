"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  ArrowRight, 
  BarChart3,
  Battery,
  Brain,
  Briefcase,
  Building,
  Check,
  CheckCircle,
  ChevronRight,
  CircuitBoard,
  DollarSign,
  Droplets,
  Eye,
  FlaskConical,
  Flower2,
  Globe,
  GraduationCap,
  HeartHandshake,
  Layers,
  Leaf,
  Menu,
  Network,
  Rocket,
  Shield,
  Sparkles,
  Sprout,
  Store,
  Sun,
  ThermometerSun,
  TrendingUp,
  Users,
  X,
  Zap,
  GlobeIcon,
  Earth,
  MapIcon,
  CompassIcon,
  LocateIcon,
  NavigationIcon,
  Anchor,
  Ship,
  Sailboat,
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  Helicopter,
  Car,
  Taxi,
  Bus,
  Truck as TruckIcon,
  Ambulance,
  FireTruck,
  PoliceCar,
  Train,
  Tram,
  Bike,
  Scooter,
  Skateboard,
  Footprints,
  Wheelchair,
  Baby,
  PersonStanding,
  Walking,
  Running,
  Accessibility,
  ParkingMeter,
  TrafficLight,
  Construction,
  Roadwork,
  Factory as FactoryIcon,
  Warehouse,
  Store as StoreIcon,
  ShoppingBag,
  ShoppingBasket,
  Cart,
  Package as PackageIcon,
  Boxes as BoxesIcon,
  Container,
  Pallet,
  Forklift,
  Conveyor,
  Crane,
  Hammer,
  Wrench as WrenchIcon,
  Screwdriver,
  Drill,
  Saw,
  Axe,
  Pickaxe,
  Shovel,
  Rake,
  Hoe,
  Wheelbarrow,
  Tractor,
  Harvester,
  Plow,
  WateringCan,
  Spray,
  Fertilizer,
  Pesticide,
  Seeds,
  Grain,
  Hay,
  Straw,
  Barn,
  Silo,
  Greenhouse,
  Shed,
  Fence,
  Gate,
  Well,
  Pump,
  Irrigation,
  Sprinkler,
  Hose,
  Tap,
  Valve,
  Pipe,
  Plumbing,
  Drain,
  Sewage,
  WaterTreatment,
  Dam,
  Bridge,
  Tunnel,
  Road,
  Highway,
  Street,
  Path,
  Trail,
  Sidewalk,
  Crosswalk,
  Junction,
  Intersection,
  Roundabout,
  Exit,
  Entrance,
  Garage,
  ParkingLot,
  ChargingStation,
  GasStation,
  OilRig,
  Pipeline,
  PowerPlant,
  SolarPanel,
  WindTurbine,
  HydroElectric,
  Nuclear,
  Coal,
  NaturalGas,
  Biomass,
  Geothermal,
  Grid,
  Transmission,
  Distribution,
  Substation,
  Transformer,
  Meter,
  SmartMeter,
  PowerLine,
  ElectricPole,
  Insulator,
  Circuit,
  Breaker,
  Fuse,
  Switch,
  Outlet,
  Plug,
  Socket,
  Adapter,
  Extension,
  PowerStrip,
  Surge,
  Ups,
  Generator,
  Inverter,
  Converter,
  Regulator,
  Controller,
  Sensor,
  Detector,
  Monitor,
  Display,
  Screen,
  Projector,
  Television,
  Radio as RadioIcon,
  Speaker,
  Headphones,
  Microphone,
  Amplifier,
  Mixer,
  Equalizer,
  Synthesizer,
  Keyboard as KeyboardIcon,
  Piano,
  Guitar,
  Drum,
  Trumpet,
  Saxophone,
  Violin,
  Cello,
  Harp,
  Accordion,
  Harmonica,
  Flute,
  Clarinet,
  Trombone,
  Tuba,
  FrenchHorn,
  Bagpipe,
  Banjo,
  Mandolin,
  Ukulele,
  Bass,
  ElectricGuitar,
  AcousticGuitar,
  ClassicalGuitar,
  BassGuitar,
  DoubleBass,
  Viola,
  Fiddle,
  StringInstrument,
  WindInstrument,
  BrassInstrument,
  Percussion,
  Woodwind,
  Orchestra,
  Band,
  Choir,
  Ensemble,
  Solo,
  Duet,
  Trio,
  Quartet,
  Quintet,
  Symphony,
  Concerto,
  Sonata,
  Opera,
  Musical,
  Ballet,
  Dance,
  Theater,
  Stage,
  Curtain,
  Spotlight,
  Backstage,
  Dressing,
  Makeup,
  Costume,
  Props,
  Script,
  Director,
  Producer,
  Actor,
  Actress,
  Performer,
  Artist,
  Musician,
  Singer,
  Dancer,
  Choreographer,
  Composer,
  Conductor,
  Maestro,
  Virtuoso,
  Prodigy,
  Talent,
  Star as StarIcon,
  Celebrity,
  Fame,
  Applause,
  StandingOvation,
  Encore,
  Bravo,
  Audience,
  Crowd,
  Fan as FanIcon,
  Ticket as TicketIcon,
  Seat,
  Row,
  Section,
  Balcony,
  Box,
  Orchestra as OrchestraIcon,
  Mezzanine,
  Gallery,
  Arena,
  Stadium,
  Venue,
  Hall,
  Auditorium,
  Amphitheater,
  Coliseum,
  Pavilion,
  Tent,
  Marquee,
  Canopy,
  Awning,
  Umbrella as UmbrellaIcon,
  Parasol,
  Shade,
  Shelter,
  Roof,
  Ceiling,
  Floor,
  Wall,
  Door,
  Window,
  Stairs,
  Elevator,
  Escalator,
  Ramp,
  Ladder,
  Scaffold,
  Platform,
  Deck,
  Porch,
  Patio,
  Terrace,
  Balcony as BalconyIcon,
  Garden,
  Yard,
  Lawn,
  Landscape,
  Park,
  Plaza,
  Square as SquareIcon,
  Courtyard,
  Fountain,
  Pond,
  Pool,
  Lake,
  River,
  Stream,
  Creek,
  Brook,
  Spring,
  Waterfall,
  Rapids,
  Ocean,
  Sea,
  Bay,
  Gulf,
  Strait,
  Channel,
  Harbor,
  Port,
  Dock,
  Pier,
  Wharf,
  Marina,
  Jetty,
  Breakwater,
  Lighthouse,
  Buoy,
  Beacon,
  Signal,
  Warning,
  Danger,
  Caution,
  Safety,
  Security,
  Protection,
  Defense,
  Guard,
  Patrol,
  Surveillance,
  Camera as CameraIcon,
  Cctv,
  Motion,
  Alarm,
  Siren,
  Bell,
  Buzzer,
  Horn,
  Whistle,
  Megaphone,
  Loudspeaker,
  Announcement,
  Broadcast,
  Transmission,
  Reception,
  Signal as SignalIcon,
  Frequency,
  Wavelength,
  Amplitude,
  Modulation,
  Demodulation,
  Encoding,
  Decoding,
  Encryption,
  Decryption,
  Cipher,
  Code,
  Key,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Password,
  Pin as PinIcon,
  Biometric,
  Fingerprint,
  FaceId,
  Iris,
  Voice,
  Signature,
  Authentication,
  Authorization,
  Verification,
  Validation,
  Certification,
  Accreditation,
  License,
  Permit,
  Registration,
  Enrollment,
  Membership,
  Subscription,
  Account,
  Profile,
  Identity,
  Credential,
  Badge,
  Pass,
  Access,
  Entry,
  Exit as ExitIcon,
  Admission,
  Entrance as EntranceIcon,
  Gateway,
  Portal,
  Passage,
  Corridor,
  Hallway,
  Lobby,
  Foyer,
  Vestibule,
  Anteroom,
  WaitingRoom,
  Reception as ReceptionIcon,
  Office,
  Desk,
  Workstation,
  Cubicle,
  Conference,
  Meeting,
  Boardroom,
  Classroom,
  Laboratory,
  Workshop,
  Studio,
  Atelier,
  Gallery as GalleryIcon,
  Museum,
  Library,
  Archive,
  Collection,
  Exhibition,
  Display as DisplayIcon,
  Showcase,
  Demonstration,
  Presentation as PresentationIcon,
  Lecture,
  Seminar,
  Symposium,
  Conference as ConferenceIcon,
  Convention,
  Summit,
  Forum,
  Panel,
  Debate,
  Discussion,
  Dialogue,
  Conversation,
  Interview,
  Consultation,
  Advice,
  Guidance,
  Counseling,
  Coaching,
  Mentoring,
  Training,
  Education,
  Learning,
  Teaching,
  Instruction,
  Curriculum,
  Course,
  Lesson,
  Module,
  Unit,
  Chapter,
  Section,
  Topic,
  Subject,
  Discipline,
  Field,
  Area,
  Domain,
  Specialty,
  Expertise,
  Knowledge,
  Wisdom,
  Understanding,
  Comprehension,
  Insight,
  Perception,
  Awareness,
  Consciousness,
  Mindfulness,
  Attention,
  Focus as FocusIcon,
  Concentration,
  Meditation,
  Contemplation,
  Reflection,
  Thought,
  Idea as IdeaIcon,
  Concept,
  Theory,
  Hypothesis,
  Thesis,
  Argument,
  Reasoning,
  Logic,
  Analysis,
  Synthesis,
  Evaluation,
  Judgment,
  Decision,
  Choice,
  Option,
  Alternative,
  Possibility,
  Opportunity,
  Chance,
  Risk,
  Uncertainty,
  Probability,
  Statistics,
  Data,
  Information,
  Facts,
  Evidence,
  Proof,
  Verification as VerificationIcon,
  Confirmation,
  Validation as ValidationIcon,
  Testing,
  Experiment,
  Trial,
  Study,
  Research,
  Investigation,
  Inquiry,
  Exploration,
  Discovery,
  Finding,
  Result,
  Outcome,
  Conclusion,
  Summary,
  Abstract,
  Overview,
  Introduction,
  Background,
  Context,
  Framework,
  Structure,
  Organization,
  System,
  Process,
  Procedure,
  Method,
  Technique,
  Approach,
  Strategy,
  Tactic,
  Plan,
  Program,
  Project,
  Initiative,
  Campaign,
  Mission,
  Vision,
  Goal,
  Objective,
  Target as TargetIcon,
  Milestone as MilestoneIcon,
  Deliverable,
  Output,
  Product,
  Service,
  Solution,
  Innovation,
  Invention,
  Creation,
  Design,
  Development,
  Implementation,
  Deployment,
  Launch,
  Release,
  Rollout,
  Introduction as IntroductionIcon,
  Adoption,
  Integration,
  Migration,
  Transition,
  Transformation,
  Change,
  Evolution,
  Revolution,
  Disruption,
  Breakthrough,
  Advancement,
  Progress,
  Improvement,
  Enhancement,
  Upgrade,
  Update,
  Patch,
  Fix,
  Repair,
  Maintenance,
  Support,
  Assistance,
  Help,
  Aid,
  Relief,
  Rescue,
  Emergency,
  Crisis,
  Disaster,
  Catastrophe,
  Calamity,
  Tragedy,
  Accident,
  Incident,
  Event,
  Occurrence,
  Happening,
  Situation,
  Circumstance,
  Condition,
  State,
  Status,
  Position,
  Location,
  Place,
  Site,
  Spot,
  Point,
  Area as AreaIcon,
  Region,
  Zone,
  Sector,
  District,
  Territory,
  Province,
  State as StateIcon,
  Country,
  Nation,
  Continent,
  World,
  Globe as GlobeIcon2,
  Earth as EarthIcon,
  Planet,
  Universe,
  Cosmos,
  Galaxy,
  Star as StarIcon2,
  Sun as SunIcon,
  Moon as MoonIcon,
  Asteroid,
  Comet as CometIcon,
  Meteor as MeteorIcon,
  SpaceStation,
  Satellite as SatelliteIcon2,
  Telescope as TelescopeIcon,
  Observatory,
  Planetarium,
  Astronomy,
  Astrophysics,
  Cosmology,
  SpaceExploration,
  SpaceTravel,
  Astronaut,
  Cosmonaut,
  SpaceSuit,
  Spacecraft,
  Rocket as RocketIcon2,
  Shuttle,
  Capsule,
  Module,
  Station,
  Base,
  Colony,
  Settlement,
  Habitat,
  Biosphere,
  Ecosystem,
  Environment,
  Nature,
  Wildlife,
  Flora,
  Fauna,
  Biodiversity,
  Conservation,
  Preservation,
  Protection as ProtectionIcon,
  Restoration,
  Regeneration,
  Sustainability,
  Renewable,
  Green,
  Eco,
  Organic,
  Natural,
  Clean,
  Pure,
  Fresh,
  Healthy,
  Wellness,
  Fitness,
  Exercise,
  Workout,
  Training as TrainingIcon,
  Sport,
  Athletics,
  Competition,
  Championship,
  Tournament,
  Match,
  Game,
  Play,
  Recreation,
  Leisure,
  Hobby,
  Pastime,
  Entertainment,
  Fun,
  Joy,
  Happiness,
  Pleasure,
  Satisfaction,
  Fulfillment,
  Achievement,
  Success,
  Victory,
  Win,
  Triumph,
  Glory,
  Honor,
  Pride,
  Dignity,
  Respect,
  Esteem,
  Reputation,
  Prestige,
  Status as StatusIcon,
  Rank,
  Level,
  Grade,
  Class,
  Category,
  Type,
  Kind,
  Sort,
  Variety,
  Species,
  Breed,
  Strain,
  Cultivar,
  Hybrid,
  Clone,
  Genotype,
  Phenotype,
  Trait,
  Characteristic,
  Feature,
  Attribute,
  Property,
  Quality,
  Value,
  Worth,
  Merit,
  Benefit,
  Advantage,
  Strength,
  Asset,
  Resource,
  Capital,
  Investment,
  Return,
  Profit,
  Gain,
  Revenue,
  Income,
  Earnings,
  Yield,
  Harvest,
  Crop,
  Produce,
  Product as ProductIcon,
  Commodity,
  Goods,
  Merchandise,
  Inventory,
  Stock,
  Supply,
  Demand,
  Market,
  Trade,
  Commerce,
  Business,
  Industry,
  Sector as SectorIcon,
  Economy,
  Finance,
  Banking,
  Insurance,
  Investment as InvestmentIcon,
  Portfolio,
  Asset as AssetIcon,
  Security as SecurityIcon,
  Bond,
  Stock as StockIcon,
  Share,
  Equity,
  Debt,
  Credit,
  Loan,
  Mortgage,
  Interest,
  Rate,
  Percentage,
  Ratio,
  Proportion,
  Fraction,
  Decimal,
  Number,
  Digit,
  Figure,
  Amount,
  Quantity,
  Volume,
  Capacity,
  Size,
  Dimension,
  Measurement,
  Unit as UnitIcon,
  Scale as ScaleIcon,
  Range,
  Scope,
  Extent,
  Degree,
  Level as LevelIcon,
  Intensity,
  Magnitude,
  Force,
  Power as PowerIcon,
  Energy,
  Strength as StrengthIcon,
  Potential,
  Kinetic,
  Thermal,
  Electric,
  Magnetic,
  Gravitational,
  Nuclear as NuclearIcon,
  Chemical,
  Biological,
  Physical,
  Mechanical,
  Optical,
  Acoustic,
  Electronic,
  Digital,
  Analog,
  Binary as BinaryIcon,
  Hexadecimal,
  Octal,
  Decimal as DecimalIcon,
  Integer,
  Float,
  Double,
  Boolean,
  String,
  Character,
  Array,
  List,
  Set,
  Map as MapIcon2,
  Dictionary,
  Hash,
  Tree,
  Graph,
  Network as NetworkIcon,
  Node,
  Edge,
  Vertex,
  Path as PathIcon,
  Route as RouteIcon,
  Connection,
  Relationship,
  Association,
  Correlation,
  Causation,
  Effect,
  Impact,
  Influence,
  Consequence,
  Result as ResultIcon,
  Outcome as OutcomeIcon,
  Output as OutputIcon,
  Input,
  Process as ProcessIcon,
  Function as FunctionIcon,
  Operation,
  Action,
  Activity as ActivityIcon,
  Task,
  Job,
  Work,
  Labor,
  Effort,
  Energy as EnergyIcon,
  Force as ForceIcon,
  Motion,
  Movement,
  Speed,
  Velocity,
  Acceleration,
  Momentum,
  Inertia,
  Friction,
  Resistance,
  Drag,
  Lift,
  Thrust,
  Propulsion,
  Drive,
  Engine,
  Motor,
  Turbine,
  Compressor,
  Pump as PumpIcon,
  Fan as FanIcon2,
  Blower,
  Vacuum,
  Pressure,
  Flow,
  Rate as RateIcon,
  Speed as SpeedIcon,
  Frequency as FrequencyIcon,
  Period,
  Cycle,
  Wave,
  Oscillation,
  Vibration,
  Resonance,
  Harmony,
  Discord,
  Noise,
  Silence,
  Sound,
  Music,
  Rhythm,
  Beat,
  Tempo,
  Melody,
  Harmony as HarmonyIcon,
  Chord,
  Note,
  Pitch,
  Tone,
  Timbre,
  Volume as VolumeIcon,
  Loudness,
  Intensity as IntensityIcon,
  Amplitude as AmplitudeIcon,
  Frequency as FrequencyIcon2,
  Wavelength as WavelengthIcon,
  Spectrum,
  Color,
  Hue,
  Saturation,
  Brightness as BrightnessIcon,
  Contrast as ContrastIcon,
  Shade as ShadeIcon,
  Tint,
  Tone as ToneIcon,
  Gradient,
  Pattern,
  Texture,
  Surface,
  Finish,
  Polish,
  Gloss,
  Matte,
  Rough,
  Smooth,
  Soft,
  Hard,
  Rigid,
  Flexible,
  Elastic,
  Plastic,
  Brittle,
  Tough,
  Durable,
  Fragile,
  Delicate,
  Robust,
  Sturdy,
  Strong,
  Weak,
  Light,
  Heavy,
  Dense,
  Sparse,
  Thick,
  Thin,
  Wide,
  Narrow,
  Long,
  Short,
  Tall,
  Low,
  High,
  Deep,
  Shallow,
  Large,
  Small,
  Big,
  Little,
  Huge,
  Tiny,
  Massive,
  Minute,
  Giant,
  Miniature,
  Macro,
  Micro,
  Nano,
  Pico,
  Femto,
  Atto,
  Zepto,
  Yocto,
  Kilo,
  Mega,
  Giga,
  Tera,
  Peta,
  Exa,
  Zetta,
  Yotta,
  Positive,
  Negative,
  Neutral,
  Active,
  Passive,
  Reactive,
  Proactive,
  Interactive,
  Dynamic,
  Static,
  Mobile,
  Fixed,
  Portable,
  Stationary,
  Movable,
  Immovable,
  Permanent,
  Temporary,
  Transient,
  Persistent,
  Ephemeral,
  Eternal,
  Infinite,
  Finite,
  Limited,
  Unlimited,
  Bounded,
  Unbounded,
  Restricted,
  Unrestricted,
  Constrained,
  Unconstrained,
  Free,
  Bound,
  Open,
  Closed,
  Public,
  Private,
  Shared,
  Exclusive,
  Common,
  Unique,
  General,
  Specific,
  Abstract,
  Concrete,
  Virtual,
  Real,
  Actual,
  Potential as PotentialIcon,
  Possible,
  Impossible,
  Probable,
  Improbable,
  Certain,
  Uncertain,
  Known,
  Unknown,
  Visible,
  Invisible,
  Transparent,
  Opaque,
  Clear,
  Cloudy,
  Bright,
  Dark,
  Light as LightIcon,
  Shadow,
  Day,
  Night,
  Dawn,
  Dusk,
  Morning,
  Evening,
  Noon,
  Midnight,
  Hour,
  Minute,
  Second,
  Millisecond,
  Microsecond,
  Nanosecond,
  Instant,
  Moment,
  Duration,
  Period as PeriodIcon,
  Interval,
  Span,
  Range as RangeIcon,
  Sequence,
  Series,
  Pattern as PatternIcon,
  Trend,
  Cycle as CycleIcon,
  Phase,
  Stage,
  Step,
  Level as LevelIcon2,
  Tier,
  Layer,
  Stack,
  Queue,
  Heap,
  Pile,
  Group,
  Cluster,
  Bundle,
  Package as PackageIcon2,
  Container as ContainerIcon,
  Box,
  Crate,
  Barrel,
  Tank,
  Vessel,
  Bottle as BottleIcon,
  Jar,
  Can,
  Tin,
  Packet,
  Envelope,
  Wrapper,
  Cover,
  Case,
  Shell,
  Housing,
  Frame,
  Structure,
  Framework,
  Skeleton,
  Foundation,
  Base as BaseIcon,
  Support,
  Pillar,
  Column,
  Beam,
  Truss,
  Arch,
  Dome,
  Vault,
  Tunnel as TunnelIcon,
  Bridge as BridgeIcon,
  Tower,
  Spire,
  Pyramid,
  Obelisk,
  Monument,
  Statue,
  Sculpture,
  Art,
  Painting,
  Drawing,
  Sketch,
  Illustration,
  Graphic,
  Image,
  Picture,
  Photo,
  Portrait,
  Landscape as LandscapeIcon,
  Still,
  Life,
  Abstract as AbstractIcon,
  Realistic,
  Impressionist,
  Expressionist,
  Surreal,
  Modern,
  Contemporary,
  Classical,
  Traditional,
  Folk,
  Ethnic,
  Cultural,
  Heritage,
  Legacy,
  Tradition,
  Custom,
  Practice,
  Ritual,
  Ceremony,
  Celebration,
  Festival,
  Holiday,
  Anniversary,
  Birthday,
  Wedding,
  Graduation,
  Retirement,
  Memorial,
  Funeral,
  Birth,
  Death,
  Life as LifeIcon,
  Existence,
  Being,
  Reality,
  Truth,
  Fact,
  Fiction,
  Fantasy,
  Dream,
  Nightmare,
  Vision as VisionIcon,
  Hallucination,
  Illusion,
  Delusion,
  Perception as PerceptionIcon,
  Sensation,
  Feeling,
  Emotion,
  Mood,
  Attitude,
  Behavior,
  Action as ActionIcon,
  Reaction,
  Response,
  Stimulus,
  Trigger,
  Cause,
  Effect as EffectIcon,
  Reason,
  Purpose,
  Intention,
  Motivation,
  Drive as DriveIcon,
  Desire,
  Need,
  Want,
  Wish,
  Hope,
  Fear,
  Anxiety,
  Stress,
  Pressure as PressureIcon,
  Tension,
  Relaxation,
  Calm,
  Peace,
  Tranquility,
  Serenity,
  Harmony as HarmonyIcon2,
  Balance,
  Equilibrium,
  Stability,
  Instability,
  Chaos,
  Order,
  Organization as OrganizationIcon,
  Structure as StructureIcon,
  System as SystemIcon,
  Network as NetworkIcon2,
  Web,
  Mesh,
  Grid as GridIcon,
  Matrix,
  Array as ArrayIcon,
  Table,
  Chart,
  Graph as GraphIcon,
  Diagram,
  Model,
  Simulation,
  Emulation,
  Imitation,
  Replication,
  Duplication,
  Copy,
  Clone as CloneIcon,
  Mirror,
  Reflection as ReflectionIcon,
  Shadow as ShadowIcon,
  Echo,
  Reverberation,
  Resonance as ResonanceIcon,
  Amplification,
  Attenuation,
  Modulation as ModulationIcon,
  Demodulation as DemodulationIcon,
  Encoding as EncodingIcon,
  Decoding as DecodingIcon,
  Compression,
  Decompression,
  Expansion,
  Contraction,
  Dilation,
  Constriction,
  Opening,
  Closing,
  Beginning,
  Ending,
  Start,
  Finish,
  Origin,
  Destination,
  Source,
  Sink,
  Input as InputIcon,
  Output as OutputIcon2,
  Throughput,
  Bandwidth,
  Capacity as CapacityIcon,
  Load,
  Stress as StressIcon,
  Strain,
  Deformation,
  Distortion,
  Warping,
  Bending,
  Twisting,
  Stretching,
  Compression as CompressionIcon,
  Shear,
  Torsion,
  Flexure,
  Buckling,
  Fracture,
  Crack,
  Break,
  Split,
  Tear,
  Cut,
  Slice,
  Chop,
  Dice,
  Mince,
  Grind,
  Crush,
  Pulverize,
  Powder,
  Dust,
  Particle,
  Grain,
  Crystal,
  Molecule,
  Atom as AtomIcon,
  Ion,
  Electron,
  Proton,
  Neutron,
  Quark,
  Photon,
  Wave as WaveIcon2,
  Particle as ParticleIcon,
  Field,
  Force as ForceIcon2,
  Energy as EnergyIcon2,
  Matter,
  Mass,
  Weight,
  Density as DensityIcon,
  Volume as VolumeIcon2,
  Area as AreaIcon2,
  Surface as SurfaceIcon,
  Perimeter,
  Circumference,
  Diameter,
  Radius,
  Center,
  Core,
  Nucleus,
  Shell as ShellIcon,
  Layer as LayerIcon,
  Coating,
  Film,
  Membrane,
  Barrier,
  Filter,
  Screen,
  Mesh as MeshIcon,
  Sieve,
  Strainer,
  Separator,
  Divider,
  Partition,
  Wall as WallIcon,
  Boundary,
  Border,
  Edge as EdgeIcon,
  Corner,
  Angle,
  Curve,
  Arc,
  Circle as CircleIcon,
  Ellipse,
  Oval,
  Sphere,
  Cylinder,
  Cone,
  Cube,
  Prism,
  Polyhedron,
  Polygon,
  Triangle as TriangleIcon,
  Square as SquareIcon2,
  Rectangle,
  Pentagon as PentagonIcon,
  Hexagon as HexagonIcon,
  Octagon as OctagonIcon,
  Decagon,
  Dodecagon,
  Star as StarIcon3,
  Cross,
  Plus,
  Minus,
  Times,
  Divide,
  Equal,
  NotEqual,
  Greater,
  Less,
  GreaterEqual,
  LessEqual,
  And,
  Or,
  Not,
  Xor,
  Nand,
  Nor,
  If,
  Then,
  Else,
  Switch as SwitchIcon,
  Case,
  Default,
  Loop,
  While,
  For,
  Do,
  Until,
  Repeat,
  Iterate,
  Recurse,
  Call,
  Return,
  Break,
  Continue,
  Skip,
  Jump,
  Goto,
  Label as LabelIcon,
  Tag as TagIcon,
  Mark,
  Flag as FlagIcon,
  Indicator,
  Pointer as PointerIcon,
  Reference,
  Anchor as AnchorIcon,
  Hook,
  Latch,
  Lock as LockIcon2,
  Key as KeyIcon,
  Code as CodeIcon,
  Cipher as CipherIcon,
  Encrypt,
  Decrypt,
  Hash as HashIcon,
  Salt,
  Token,
  Session,
  Cookie,
  Cache,
  Buffer,
  Queue as QueueIcon,
  Stack as StackIcon,
  Heap as HeapIcon,
  Pool,
  Reservoir,
  Tank as TankIcon,
  Storage,
  Memory,
  Disk,
  Drive as DriveIcon2,
  Volume as VolumeIcon3,
  Partition as PartitionIcon,
  Sector as SectorIcon2,
  Block,
  Page,
  File,
  Folder,
  Directory,
  Path as PathIcon2,
  Tree as TreeIcon,
  Branch,
  Leaf as LeafIcon,
  Root,
  Node as NodeIcon,
  Parent,
  Child,
  Sibling,
  Ancestor,
  Descendant,
  Relative,
  Absolute,
  Local,
  Global,
  Universal,
  Specific as SpecificIcon,
  General as GeneralIcon,
  Particular,
  Individual,
  Collective,
  Group as GroupIcon,
  Team,
  Organization as OrganizationIcon2,
  Company,
  Corporation,
  Enterprise,
  Business as BusinessIcon,
  Firm,
  Agency,
  Institution,
  Foundation as FoundationIcon,
  Association,
  Society,
  Club,
  Union,
  Federation,
  Alliance,
  Coalition,
  Partnership,
  Collaboration,
  Cooperation,
  Coordination,
  Integration as IntegrationIcon,
  Merger,
  Acquisition,
  Joint,
  Venture,
  Consortium,
  Syndicate,
  Cartel,
  Trust,
  Monopoly,
  Oligopoly,
  Competition as CompetitionIcon,
  Market as MarketIcon,
  Industry as IndustryIcon,
  Sector as SectorIcon3,
  Field as FieldIcon,
  Domain as DomainIcon,
  Area as AreaIcon3,
  Region as RegionIcon,
  Zone as ZoneIcon,
  District as DistrictIcon,
  Territory as TerritoryIcon,
  Province as ProvinceIcon,
  State as StateIcon2,
  Country as CountryIcon,
  Nation as NationIcon,
  Continent as ContinentIcon,
  World as WorldIcon,
  Globe as GlobeIcon3,
  Earth as EarthIcon2,
  Planet as PlanetIcon2,
  Moon as MoonIcon2,
  Star as StarIcon4,
  Sun as SunIcon2,
  Galaxy as GalaxyIcon,
  Universe as UniverseIcon,
  Cosmos as CosmosIcon,
  Space,
  Time,
  Dimension as DimensionIcon,
  Reality as RealityIcon,
  Virtual as VirtualIcon,
  Augmented,
  Mixed,
  Extended,
  Immersive,
  Interactive as InteractiveIcon,
  Responsive,
  Adaptive,
  Intelligent,
  Smart,
  Automated,
  Autonomous,
  Self,
  Manual,
  Automatic,
  Semi,
  Hybrid,
  Dual,
  Multi,
  Single,
  Double,
  Triple,
  Quad,
  Penta,
  Hexa,
  Hepta,
  Octa,
  Nona,
  Deca,
  Hundred,
  Thousand,
  Million,
  Billion,
  Trillion,
  Infinite as InfiniteIcon,
  Zero,
  One,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  First,
  Second as SecondIcon,
  Third,
  Fourth,
  Fifth,
  Sixth,
  Seventh,
  Eighth,
  Ninth,
  Tenth,
  Last,
  Final,
  Ultimate,
  Penultimate,
  Primary,
  Secondary,
  Tertiary,
  Quaternary,
  Main,
  Auxiliary,
  Backup,
  Reserve,
  Spare,
  Extra,
  Additional,
  Supplementary,
  Complementary,
  Alternative as AlternativeIcon,
  Optional,
  Mandatory,
  Required,
  Necessary,
  Essential,
  Critical,
  Vital,
  Important,
  Significant,
  Major,
  Minor,
  Trivial,
  Negligible,
  Marginal,
  Substantial,
  Considerable,
  Moderate,
  Minimal,
  Maximal,
  Optimal,
  Suboptimal,
  Ideal,
  Perfect,
  Imperfect,
  Flawed,
  Defective,
  Faulty,
  Broken,
  Damaged,
  Repaired,
  Fixed as FixedIcon,
  Restored,
  Renewed,
  Refreshed,
  Updated,
  Upgraded,
  Improved,
  Enhanced,
  Advanced,
  Modern as ModernIcon,
  Contemporary as ContemporaryIcon,
  Current,
  Latest,
  Newest,
  Recent,
  Fresh as FreshIcon,
  Novel,
  Original,
  Innovative,
  Creative,
  Inventive,
  Imaginative,
  Artistic,
  Aesthetic,
  Beautiful,
  Elegant,
  Graceful,
  Refined,
  Sophisticated,
  Simple,
  Complex,
  Complicated,
  Intricate,
  Elaborate,
  Detailed,
  Thorough,
  Comprehensive,
  Complete,
  Partial,
  Incomplete,
  Full,
  Empty,
  Vacant,
  Occupied,
  Available,
  Unavailable,
  Free as FreeIcon,
  Busy,
  Idle,
  Active as ActiveIcon,
  Inactive,
  Enabled,
  Disabled,
  On,
  Off,
  True,
  False,
  Yes,
  No,
  Maybe,
  Perhaps,
  Possibly,
  Probably,
  Certainly,
  Definitely,
  Absolutely,
  Never,
  Always,
  Sometimes,
  Often,
  Rarely,
  Occasionally,
  Frequently,
  Constantly,
  Continuously,
  Intermittently,
  Periodically,
  Regularly,
  Irregularly,
  Randomly,
  Systematically,
  Methodically,
  Carefully,
  Cautiously,
  Boldly,
  Bravely,
  Courageously,
  Fearlessly,
  Timidly,
  Hesitantly,
  Confidently,
  Assertively,
  Aggressively,
  Passively,
  Actively as ActivelyIcon,
  Proactively,
  Reactively,
  Responsively,
  Adaptively,
  Flexibly,
  Rigidly,
  Strictly,
  Loosely,
  Tightly,
  Firmly,
  Gently,
  Softly,
  Harshly,
  Roughly,
  Smoothly,
  Evenly,
  Unevenly,
  Uniformly,
  Variably,
  Consistently,
  Inconsistently,
  Predictably,
  Unpredictably,
  Reliably,
  Unreliably,
  Accurately,
  Precisely,
  Approximately,
  Roughly as RoughlyIcon,
  Exactly,
  Nearly,
  Almost,
  Barely,
  Hardly,
  Scarcely,
  Merely,
  Simply,
  Purely,
  Solely,
  Only,
  Just,
  Even,
  Still,
  Yet,
  Already,
  Soon,
  Later,
  Earlier,
  Now,
  Then,
  When,
  Where,
  Why,
  How,
  What,
  Which,
  Who,
  Whom,
  Whose,
  That,
  This,
  These,
  Those,
  Here,
  There,
  Everywhere,
  Nowhere,
  Somewhere,
  Anywhere,
  Elsewhere,
  Above,
  Below,
  Beside,
  Between,
  Among,
  Within,
  Without,
  Inside,
  Outside,
  Throughout,
  Beyond,
  Behind,
  Before,
  After,
  During,
  Since,
  Until,
  While as WhileIcon,
  Because,
  Although,
  Though,
  Despite,
  However,
  Nevertheless,
  Nonetheless,
  Moreover,
  Furthermore,
  Additionally,
  Also,
  Too,
  Either,
  Neither,
  Both,
  All,
  None,
  Some,
  Any,
  Many,
  Few,
  Several,
  Various,
  Numerous,
  Countless,
  Infinite as InfiniteIcon2,
  Finite as FiniteIcon,
  Limited as LimitedIcon,
  Unlimited as UnlimitedIcon,
  Bounded as BoundedIcon,
  Unbounded as UnboundedIcon
} from 'lucide-react'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 w-full overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-gray-900/95 backdrop-blur-xl shadow-2xl' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-12">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Vibelux</span>
              </Link>
              
              <div className="hidden lg:flex items-center gap-8">
                {/* Solutions Dropdown */}
                <div className="relative group">
                  <button className="text-gray-300 hover:text-white transition-colors font-medium flex items-center gap-1">
                    Solutions
                    <ChevronRight className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link href="/growing" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-t-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <Leaf className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="font-medium">Growing Operations</div>
                          <div className="text-xs text-gray-500">Optimize your cultivation</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/energy" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <div>
                          <div className="font-medium">Energy Management</div>
                          <div className="text-xs text-gray-500">Reduce costs & earn revenue</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/research" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <FlaskConical className="w-5 h-5 text-purple-500" />
                        <div>
                          <div className="font-medium">Research Tools</div>
                          <div className="text-xs text-gray-500">Statistical analysis & trials</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/marketplace" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-b-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <Store className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium">Marketplace</div>
                          <div className="text-xs text-gray-500">Buy & sell produce</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Platform Dropdown */}
                <div className="relative group">
                  <button className="text-gray-300 hover:text-white transition-colors font-medium flex items-center gap-1">
                    Platform
                    <ChevronRight className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link href="/features" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-t-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <Layers className="w-5 h-5 text-indigo-500" />
                        <div>
                          <div className="font-medium">All Features</div>
                          <div className="text-xs text-gray-500">Complete overview</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/sensors" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <CircuitBoard className="w-5 h-5 text-cyan-500" />
                        <div>
                          <div className="font-medium">Sensor Platform</div>
                          <div className="text-xs text-gray-500">IoT management</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/integrations" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <Network className="w-5 h-5 text-orange-500" />
                        <div>
                          <div className="font-medium">Integrations</div>
                          <div className="text-xs text-gray-500">BMS, IoT & APIs</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/admin" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-b-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-red-500" />
                        <div>
                          <div className="font-medium">Admin Portal</div>
                          <div className="text-xs text-gray-500">Operations center</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>

                <Link href="/investment" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Investment
                </Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Pricing
                </Link>
                <Link href="/resources" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Resources
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="hidden lg:flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="hidden lg:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-purple-600/30 font-medium"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-green-900/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-600/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
          </div>
        </div>
        
        <div className="relative max-w-8xl mx-auto px-8 lg:px-12 py-20 lg:py-32 w-full">
          <div className="text-center max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full text-base font-medium">
                <Leaf className="w-5 h-5 mr-2" />
                Complete CEA Operations Platform
              </Badge>
            </div>
            
            <h1 className="text-6xl lg:text-8xl xl:text-9xl font-bold text-white mb-8 leading-tight">
              Grow Smarter.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-green-400 animate-gradient">
                Save More. Earn Revenue.
              </span>
            </h1>
            
            <p className="text-2xl lg:text-3xl text-gray-300 mb-12 max-w-5xl mx-auto leading-relaxed">
              The most advanced platform for controlled environment agriculture. Optimize growing conditions, 
              reduce energy costs by 30-50%, unlock new revenue streams, and make data-driven decisions with AI-powered insights.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <Link 
                href="/demo"
                className="flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full transition-all duration-300 shadow-xl hover:shadow-purple-600/30 font-semibold text-xl"
              >
                <Eye className="w-6 h-6" />
                See Live Demo
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Link 
                href="/signup"
                className="flex items-center gap-3 px-12 py-5 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-all duration-300 font-semibold text-xl border border-gray-700"
              >
                <Rocket className="w-6 h-6" />
                Start Free Trial
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">500+</div>
                <div className="text-base text-gray-400">Active Facilities</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">30-50%</div>
                <div className="text-base text-gray-400">Energy Savings</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">25%</div>
                <div className="text-base text-gray-400">Yield Increase</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">$0</div>
                <div className="text-base text-gray-400">Upfront Cost</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-6 h-6 text-gray-400 rotate-90" />
        </div>
      </section>

      {/* Core Platform Features */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to Run a Modern CEA Facility
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From cultivation optimization to business operations, all in one integrated platform
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Growing Operations */}
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Growing Operations</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Environmental controls
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Lighting optimization
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Crop tracking & yield
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Pest & disease mgmt
                </li>
              </ul>
              <Link href="/growing" className="mt-6 inline-flex items-center gap-2 text-green-500 hover:text-green-400 font-medium">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Energy & Cost Savings */}
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Energy Management</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-500" />
                  Real-time optimization
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-500" />
                  Demand response
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-500" />
                  Grid participation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-500" />
                  Revenue generation
                </li>
              </ul>
              <Link href="/energy" className="mt-6 inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 font-medium">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Research & Analytics */}
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <FlaskConical className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Research & Analytics</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  Statistical analysis
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  Trial design tools
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  AI/ML predictions
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  CFD modeling
                </li>
              </ul>
              <Link href="/research" className="mt-6 inline-flex items-center gap-2 text-purple-500 hover:text-purple-400 font-medium">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Business Operations */}
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <Store className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Business Operations</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  Produce marketplace
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  Financial tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  Multi-facility mgmt
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  Investment platform
                </li>
              </ul>
              <Link href="/marketplace" className="mt-6 inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 font-medium">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Capabilities Grid */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Comprehensive Platform Capabilities
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Advanced tools and features designed specifically for CEA operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Environmental Control */}
            <div className="group relative bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl p-8 border border-green-800/30 hover:border-green-700/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <ThermometerSun className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Environmental Control</h3>
              </div>
              <p className="text-gray-400">
                Precise control over temperature, humidity, CO2, and VPD with automated adjustments based on crop stage and external conditions.
              </p>
            </div>

            {/* Lighting Systems */}
            <div className="group relative bg-gradient-to-br from-yellow-900/20 to-amber-900/20 rounded-2xl p-8 border border-yellow-800/30 hover:border-yellow-700/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Sun className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Advanced Lighting</h3>
              </div>
              <p className="text-gray-400">
                Spectral optimization, DLI management, photoperiod control, and integration with natural light for maximum efficiency.
              </p>
            </div>

            {/* Sensor Platform */}
            <div className="group relative bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl p-8 border border-blue-800/30 hover:border-blue-700/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <CircuitBoard className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">IoT Sensor Network</h3>
              </div>
              <p className="text-gray-400">
                25+ sensor types including LICOR quantum sensors, wireless nodes, and virtual sensors with real-time monitoring.
              </p>
            </div>

            {/* AI/ML Predictions */}
            <div className="group relative bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-800/30 hover:border-purple-700/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">AI-Powered Insights</h3>
              </div>
              <p className="text-gray-400">
                Yield predictions, anomaly detection, optimization recommendations, and predictive maintenance powered by machine learning.
              </p>
            </div>

            {/* Crop Management */}
            <div className="group relative bg-gradient-to-br from-emerald-900/20 to-green-900/20 rounded-2xl p-8 border border-emerald-800/30 hover:border-emerald-700/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Sprout className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Crop Management</h3>
              </div>
              <p className="text-gray-400">
                Batch tracking, growth stage monitoring, harvest planning, and comprehensive traceability from seed to sale.
              </p>
            </div>

            {/* Financial Analytics */}
            <div className="group relative bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-2xl p-8 border border-orange-800/30 hover:border-orange-700/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Financial Analytics</h3>
              </div>
              <p className="text-gray-400">
                Cost per gram tracking, ROI analysis, revenue forecasting, and detailed financial reporting across all operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Opportunities Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Turn Your Facility into a Profit Center
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Beyond growing great crops, unlock multiple revenue streams and cost savings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Energy Savings */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <DollarSign className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Energy Cost Reduction</h3>
              <p className="text-gray-400 mb-4">
                Reduce energy costs by 30-50% through intelligent optimization, off-peak scheduling, and demand management.
              </p>
              <div className="text-2xl font-bold text-green-500">30-50%</div>
              <div className="text-sm text-gray-500">Average savings</div>
            </div>

            {/* Grid Revenue */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <Battery className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Grid Participation</h3>
              <p className="text-gray-400 mb-4">
                Earn revenue through demand response programs, capacity markets, and energy arbitrage opportunities.
              </p>
              <div className="text-2xl font-bold text-yellow-500">$50-125K</div>
              <div className="text-sm text-gray-500">Annual revenue potential</div>
            </div>

            {/* Yield Optimization */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <TrendingUp className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Yield Improvement</h3>
              <p className="text-gray-400 mb-4">
                Increase yields by 15-25% through optimized growing conditions, AI predictions, and data-driven decisions.
              </p>
              <div className="text-2xl font-bold text-purple-500">15-25%</div>
              <div className="text-sm text-gray-500">Yield increase</div>
            </div>
          </div>

          {/* Revenue Sharing Model */}
          <div className="mt-16 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-2xl p-8 border border-green-800/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Start with $0 Upfront Cost
                </h3>
                <p className="text-gray-300 mb-4">
                  Our revenue-sharing model means you pay nothing upfront. We only succeed when you succeed, 
                  taking a small share of the savings and revenue we generate for you.
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    No hardware or software costs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Professional installation included
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    80/20 revenue split in your favor
                  </li>
                </ul>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-green-500/20 rounded-full mb-4">
                  <HeartHandshake className="w-16 h-16 text-green-500" />
                </div>
                <p className="text-xl font-semibold text-white">Win-Win Partnership</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Architecture */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Enterprise-Grade Platform Architecture
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built for scale, security, and reliability
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Integration Capabilities */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <Network className="w-12 h-12 text-cyan-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Universal Integration</h3>
              <p className="text-gray-400 mb-4">
                Seamlessly connects with existing BMS, climate computers, ERPs, and IoT devices. 
                Open API for custom integrations.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Priva, Argus, Link4 compatible</li>
                <li>• REST & GraphQL APIs</li>
                <li>• Webhook support</li>
                <li>• Real-time data sync</li>
              </ul>
            </div>

            {/* Security & Compliance */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <Shield className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Security & Compliance</h3>
              <p className="text-gray-400 mb-4">
                Bank-level security with SOC 2 compliance, end-to-end encryption, and comprehensive audit trails.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• 256-bit encryption</li>
                <li>• Role-based access control</li>
                <li>• GDPR & CCPA compliant</li>
                <li>• 24/7 monitoring</li>
              </ul>
            </div>

            {/* Scalability */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <Layers className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Infinite Scalability</h3>
              <p className="text-gray-400 mb-4">
                From single rooms to multi-facility operations. Cloud-native architecture scales with your business.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Multi-facility support</li>
                <li>• 99.9% uptime SLA</li>
                <li>• Global CDN</li>
                <li>• Auto-scaling infrastructure</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Every Type of CEA Operation
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From boutique grows to industrial-scale operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <Flower2 className="w-12 h-12 text-green-500 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">Cannabis Cultivation</h3>
              <p className="text-gray-400 mb-4">
                Optimize cannabinoid profiles, maintain compliance, track from mother to sale, and maximize quality.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  State compliance tools
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Batch & strain tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Terpene optimization
                </li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <Building className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">Vertical Farms</h3>
              <p className="text-gray-400 mb-4">
                Maximize space efficiency, optimize stack lighting, manage multiple crops, and reduce urban energy costs.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  Zone-based control
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  Stack optimization
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  Labor tracking
                </li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <Sun className="w-12 h-12 text-yellow-500 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">Greenhouses</h3>
              <p className="text-gray-400 mb-4">
                Integrate natural and supplemental light, optimize heating/cooling, and manage large-scale operations.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-500" />
                  DLI optimization
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-500" />
                  Shade curtain control
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-500" />
                  Weather integration
                </li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <GraduationCap className="w-12 h-12 text-purple-500 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">Research Facilities</h3>
              <p className="text-gray-400 mb-4">
                Design experiments, analyze results, publish findings, and advance agricultural science.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  ANOVA & statistics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  Trial replication
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  Data export tools
                </li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <Droplets className="w-12 h-12 text-cyan-500 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">Hydroponics</h3>
              <p className="text-gray-400 mb-4">
                Monitor water quality, automate nutrient delivery, and optimize hydroponic growing systems.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-500" />
                  Water quality monitoring
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-500" />
                  pH/EC automation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-500" />
                  Nutrient dosing schedules
                </li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <Briefcase className="w-12 h-12 text-orange-500 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">Consultants</h3>
              <p className="text-gray-400 mb-4">
                Manage multiple clients, generate reports, provide remote monitoring, and scale your practice.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-500" />
                  Multi-client dashboard
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-500" />
                  White-label options
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-500" />
                  Remote diagnostics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Success Stories */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Success Stories from the Field
            </h2>
            <p className="text-xl text-gray-400">
              Real results from real growers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  VF
                </div>
                <div>
                  <h4 className="font-semibold text-white">VertiFarms Austin</h4>
                  <p className="text-sm text-gray-400">25,000 sq ft vertical farm</p>
                </div>
              </div>
              <blockquote className="text-gray-300 mb-4">
                "Vibelux helped us reduce energy costs by 42% while increasing yields by 18%. 
                The grid revenue alone covers our monthly platform costs."
              </blockquote>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="text-gray-400">Energy Saved</p>
                  <p className="text-xl font-bold text-green-500">42%</p>
                </div>
                <div>
                  <p className="text-gray-400">Yield Increase</p>
                  <p className="text-xl font-bold text-purple-500">18%</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  GG
                </div>
                <div>
                  <h4 className="font-semibold text-white">Golden Greens</h4>
                  <p className="text-sm text-gray-400">Cannabis cultivation</p>
                </div>
              </div>
              <blockquote className="text-gray-300 mb-4">
                "The spectral analysis tools helped us dial in our lighting perfectly. 
                Quality is up, and we're saving $12k/month on energy."
              </blockquote>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="text-gray-400">Monthly Savings</p>
                  <p className="text-xl font-bold text-green-500">$12K</p>
                </div>
                <div>
                  <p className="text-gray-400">THC Increase</p>
                  <p className="text-xl font-bold text-purple-500">15%</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  UG
                </div>
                <div>
                  <h4 className="font-semibold text-white">Urban Greens NYC</h4>
                  <p className="text-sm text-gray-400">Rooftop greenhouse</p>
                </div>
              </div>
              <blockquote className="text-gray-300 mb-4">
                "Participating in NYC's demand response program through Vibelux generates 
                $75k annually with zero effort on our part."
              </blockquote>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="text-gray-400">Grid Revenue</p>
                  <p className="text-xl font-bold text-green-500">$75K</p>
                </div>
                <div>
                  <p className="text-gray-400">ROI Period</p>
                  <p className="text-xl font-bold text-purple-500">3 mo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-purple-900/20 to-green-900/20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your CEA Operation?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of facilities already optimizing their operations, reducing costs, 
            and generating new revenue streams with Vibelux.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/demo"
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full transition-all duration-300 shadow-xl hover:shadow-purple-600/30 font-medium text-lg"
            >
              <Eye className="w-5 h-5" />
              Schedule Live Demo
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/contact"
              className="flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-all duration-300 font-medium text-lg border border-gray-700"
            >
              <Users className="w-5 h-5" />
              Talk to an Expert
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-400">
            No credit card required • 30-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Vibelux</span>
              </div>
              <p className="text-gray-400 mb-4">
                The most advanced platform for controlled environment agriculture. 
                Grow smarter, save more, and unlock new revenue streams.
              </p>
              <div className="flex gap-4">
                <Link href="/twitter" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="w-5 h-5" />
                </Link>
                <Link href="/linkedin" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="w-5 h-5" />
                </Link>
                <Link href="/youtube" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="w-5 h-5" />
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Solutions</h3>
              <ul className="space-y-2">
                <li><Link href="/growing" className="text-gray-400 hover:text-white transition-colors">Growing Ops</Link></li>
                <li><Link href="/energy" className="text-gray-400 hover:text-white transition-colors">Energy Mgmt</Link></li>
                <li><Link href="/research" className="text-gray-400 hover:text-white transition-colors">Research</Link></li>
                <li><Link href="/marketplace" className="text-gray-400 hover:text-white transition-colors">Marketplace</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/sensors" className="text-gray-400 hover:text-white transition-colors">Sensors</Link></li>
                <li><Link href="/integrations" className="text-gray-400 hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="/api" className="text-gray-400 hover:text-white transition-colors">API Docs</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/investment" className="text-gray-400 hover:text-white transition-colors">Investment</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 Vibelux. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</Link>
              <Link href="/security" className="text-gray-400 hover:text-white transition-colors text-sm">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

{/* Badge Component */}
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      {children}
    </div>
  )
}