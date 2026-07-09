/**
 * 🕌 SHEIKHA EXPANDED PROGRAMMING LANGUAGES UNIVERSE
 * 
 * بسم الله الرحمن الرحيم
 * 
 * Comprehensive coverage of 100+ programming languages across all systems,
 * layers, paradigms, and rare/esoteric systems
 */

'use strict';

class SheikhaExpandedLanguagesUniverse {
  constructor() {
    this.all_languages = new Map();
    this.languages_by_layer = new Map();
    this.languages_by_paradigm = new Map();
    this.languages_by_domain = new Map();
    this.rare_systems = new Map();
    this.specialized_systems = new Map();
    this.total_languages_registered = 0;
  }

  /**
   * Initialize the expanded universe
   */
  initializeUniverse() {
    console.log('🌍 Initializing Sheikha Expanded Languages Universe...');
    this.registerAllLanguages();
    this.registerRareSystems();
    this.registerSpecializedSystems();
    console.log(`✅ Universe initialized with ${this.total_languages_registered} languages`);
    return {
      total_languages: this.total_languages_registered,
      rare_systems: this.rare_systems.size,
      specialized_systems: this.specialized_systems.size
    };
  }

  /**
   * Register all programming languages across all layers and paradigms
   */
  registerAllLanguages() {
    const languages = {
      // TIER 1: THE GIANTS (Most popular, industry standards)
      'Python': {
        tier: 'TIER_1_GIANT',
        layer: 'LAYER_3_HIGH_LEVEL',
        paradigms: ['Imperative', 'OOP', 'Functional', 'Procedural'],
        domains: ['Data Science', 'Web', 'AI/ML', 'Automation', 'Education'],
        release_year: 1991,
        creator: 'Guido van Rossum',
        strength: 'Readability, rapid development, huge ecosystem'
      },
      'JavaScript': {
        tier: 'TIER_1_GIANT',
        layer: 'LAYER_3_HIGH_LEVEL',
        paradigms: ['Imperative', 'OOP', 'Functional', 'Event-driven'],
        domains: ['Web Frontend', 'Web Backend (Node.js)', 'Mobile', 'IoT'],
        release_year: 1995,
        creator: 'Brendan Eich',
        strength: 'Ubiquity on web, runtime in every browser'
      },
      'Java': {
        tier: 'TIER_1_GIANT',
        layer: 'LAYER_3_HIGH_LEVEL',
        paradigms: ['OOP', 'Imperative', 'Functional (Java 8+)'],
        domains: ['Enterprise', 'Android', 'Big Data', 'Cloud'],
        release_year: 1995,
        creator: 'James Gosling (Sun Microsystems)',
        strength: 'Enterprise ecosystem, JVM performance, cross-platform'
      },
      'C#': {
        tier: 'TIER_1_GIANT',
        layer: 'LAYER_3_HIGH_LEVEL',
        paradigms: ['OOP', 'Imperative', 'Functional', 'Async'],
        domains: ['Enterprise', 'Game Development (Unity)', 'Web (ASP.NET)', 'Desktop'],
        release_year: 2000,
        creator: 'Anders Hejlsberg (Microsoft)',
        strength: '.NET ecosystem, game development with Unity'
      },
      'C++': {
        tier: 'TIER_1_GIANT',
        layer: 'LAYER_2_MID_LEVEL',
        paradigms: ['Imperative', 'OOP', 'Generic', 'Functional'],
        domains: ['Systems', 'High Performance', 'Game engines', 'OS kernels'],
        release_year: 1985,
        creator: 'Bjarne Stroustrup',
        strength: 'Raw performance, zero-cost abstractions, efficiency'
      },

      // TIER 2: MODERN SYSTEMS (Popular, modern design)
      'Rust': {
        tier: 'TIER_2_MODERN_SYSTEMS',
        layer: 'LAYER_2_MID_LEVEL',
        paradigms: ['Imperative', 'Functional', 'OOP'],
        domains: ['Systems', 'Blockchain', 'WebAssembly', 'Performance'],
        release_year: 2010,
        creator: 'Graydon Hoare (Mozilla)',
        strength: 'Memory safety without GC, fearless concurrency'
      },
      'Go': {
        tier: 'TIER_2_MODERN_SYSTEMS',
        layer: 'LAYER_2_MID_LEVEL',
        paradigms: ['Imperative', 'OOP-lite', 'Concurrent'],
        domains: ['Cloud infrastructure', 'Microservices', 'Systems', 'DevOps'],
        release_year: 2009,
        creator: 'Robert Griesemer, Rob Pike, Ken Thompson (Google)',
        strength: 'Simplicity, fast compilation, goroutines concurrency'
      },
      'Swift': {
        tier: 'TIER_2_MODERN_SYSTEMS',
        layer: 'LAYER_3_HIGH_LEVEL',
        paradigms: ['Imperative', 'OOP', 'Functional', 'Protocol-oriented'],
        domains: ['iOS', 'macOS', 'watchOS', 'tvOS', 'Server'],
        release_year: 2014,
        creator: 'Apple Inc.',
        strength: 'Modern language design, Apple ecosystem integration'
      },
      'Kotlin': {
        tier: 'TIER_2_MODERN_SYSTEMS',
        layer: 'LAYER_3_HIGH_LEVEL',
        paradigms: ['OOP', 'Functional', 'Imperative'],
        domains: ['Android', 'JVM', 'Multiplatform'],
        release_year: 2011,
        creator: 'JetBrains',
        strength: 'Interop with Java, official Android support'
      },
      'Dart': {
        tier: 'TIER_2_MODERN_SYSTEMS',
        layer: 'LAYER_3_HIGH_LEVEL',
        paradigms: ['OOP', 'Imperative', 'Functional'],
        domains: ['Mobile (Flutter)', 'Web', 'Backend'],
        release_year: 2011,
        creator: 'Google',
        strength: 'Flutter framework for cross-platform mobile'
      },

      // TIER 3: DATA & AI
      'R': {
        tier: 'TIER_3_DATA_AI',
        layer: 'LAYER_4_VERY_HIGH_LEVEL',
        paradigms: ['Functional', 'Imperative', 'OOP'],
        domains: ['Statistical analysis', 'Data science', 'Machine learning'],
        release_year: 1995,
        creator: 'Ross Ihaka, Robert Gentleman',
        strength: 'Specialized for statistics and data analysis'
      },
      'Julia': {
        tier: 'TIER_3_DATA_AI',
        layer: 'LAYER_4_VERY_HIGH_LEVEL',
        paradigms: ['Multiple dispatch', 'Functional', 'Imperative'],
        domains: ['Scientific computing', 'Data science', 'Numerical analysis'],
        release_year: 2012,
        creator: 'MIT',
        strength: 'High-performance scientific computing'
      },
      'MATLAB': {
        tier: 'TIER_3_DATA_AI',
        layer: 'LAYER_4_VERY_HIGH_LEVEL',
        paradigms: ['Imperative', 'Matrix-oriented'],
        domains: ['Engineering', 'Simulation', 'Signal processing'],
        release_year: 1984,
        creator: 'The MathWorks',
        strength: 'Specialized for matrix operations and numerical analysis'
      },
      'Scala': {
        tier: 'TIER_3_DATA_AI',
        layer: 'LAYER_3_HIGH_LEVEL',
        paradigms: ['OOP', 'Functional', 'Concurrent'],
        domains: ['Big data (Spark)', 'JVM ecosystem'],
        release_year: 2004,
        creator: 'Martin Odersky',
        strength: 'Functional + OOP integration, Spark framework'
      },

      // TIER 4: LEGACY (Still in use, historical importance)
      'COBOL': {
        tier: 'TIER_4_LEGACY',
        layer: 'LAYER_3_HIGH_LEVEL',
        paradigms: ['Imperative', 'Procedural'],
        domains: ['Banking', 'Government', 'Finance'],
        release_year: 1959,
        creator: 'CODASYL',
        strength: 'Still powers billions in legacy systems'
      },
      'Fortran': {
        tier: 'TIER_4_LEGACY',
        layer: 'LAYER_3_HIGH_LEVEL',
        paradigms: ['Imperative', 'Procedural'],
        domains: ['Scientific computing', 'Numerical analysis', 'HPC'],
        release_year: 1957,
        creator: 'John Backus (IBM)',
        strength: 'Optimized for scientific computation, extreme performance'
      },
      'Lisp': {
        tier: 'TIER_4_LEGACY',
        layer: 'LAYER_5_PARADIGM_SPECIFIC',
        paradigms: ['Functional', 'Meta-programming'],
        domains: ['AI', 'Symbolic computing', 'Education'],
        release_year: 1958,
        creator: 'John McCarthy',
        strength: 'Code as data, powerful metaprogramming'
      },
      'Ada': {
        tier: 'TIER_4_LEGACY',
        layer: 'LAYER_3_HIGH_LEVEL',
        paradigms: ['Imperative', 'OOP', 'Procedural'],
        domains: ['Defense', 'Aerospace', 'Critical systems'],
        release_year: 1980,
        creator: 'U.S. Department of Defense',
        strength: 'Strong typing, designed for safety-critical systems'
      },

      // TIER 5: FUNCTIONAL LANGUAGES
      'Haskell': {
        tier: 'TIER_5_SPECIALIZED',
        layer: 'LAYER_5_PARADIGM_SPECIFIC',
        paradigms: ['Purely functional', 'Lazy evaluation'],
        domains: ['Academic research', 'Finance'],
        release_year: 1990,
        creator: 'Simon Peyton Jones (committee)',
        strength: 'Pure functional, provable correctness, category theory'
      },
      'Clojure': {
        tier: 'TIER_5_SPECIALIZED',
        layer: 'LAYER_5_PARADIGM_SPECIFIC',
        paradigms: ['Functional', 'Lisp-like', 'Data-oriented'],
        domains: ['Concurrent systems', 'Data processing'],
        release_year: 2007,
        creator: 'Rich Hickey',
        strength: 'Immutable data, persistent data structures, JVM'
      },
      'Elixir': {
        tier: 'TIER_5_SPECIALIZED',
        layer: 'LAYER_5_PARADIGM_SPECIFIC',
        paradigms: ['Functional', 'Concurrent', 'Distributed'],
        domains: ['Real-time systems', 'Telecom', 'IoT'],
        release_year: 2011,
        creator: 'José Valim',
        strength: 'Distributed, fault-tolerant, hot reloading'
      },
      'Erlang': {
        tier: 'TIER_5_SPECIALIZED',
        layer: 'LAYER_5_PARADIGM_SPECIFIC',
        paradigms: ['Functional', 'Actor-based', 'Concurrent'],
        domains: ['Telecom', 'Distributed systems', 'Real-time'],
        release_year: 1986,
        creator: 'Ericsson',
        strength: 'Designed for distributed systems, "Let it crash" philosophy'
      },
      'F#': {
        tier: 'TIER_5_SPECIALIZED',
        layer: 'LAYER_5_PARADIGM_SPECIFIC',
        paradigms: ['Functional', 'OOP', 'Imperative'],
        domains: ['.NET ecosystem', 'Quantitative finance', 'Data processing'],
        release_year: 2005,
        creator: 'Don Syme (Microsoft Research)',
        strength: '.NET integration, strong type inference'
      },

      // TIER 6: WEB & SCRIPTING
      'PHP': {
        tier: 'TIER_6_SPECIALIZED',
        layer: 'LAYER_3_HIGH_LEVEL',
        paradigms: ['Imperative', 'OOP', 'Functional'],
        domains: ['Web backend', 'Server-side scripting'],
        release_year: 1995,
        creator: 'Rasmus Lerdorf',
        strength: 'Easy hosting, rapid web development'
      },
      'Ruby': {
        tier: 'TIER_6_SPECIALIZED',
        layer: 'LAYER_3_HIGH_LEVEL',
        paradigms: ['OOP', 'Functional', 'Imperative'],
        domains: ['Web (Rails)', 'Automation', 'DevOps'],
        release_year: 1995,
        creator: 'Yukihiro Matsumoto',
        strength: 'Readability, Rails framework, automation'
      },
      'Perl': {
        tier: 'TIER_6_SPECIALIZED',
        layer: 'LAYER_3_HIGH_LEVEL',
        paradigms: ['Imperative', 'Functional', 'OOP'],
        domains: ['System administration', 'Text processing', 'Automation'],
        release_year: 1987,
        creator: 'Larry Wall',
        strength: 'Text manipulation, POSIX integration'
      },
      'TypeScript': {
        tier: 'TIER_6_SPECIALIZED',
        layer: 'LAYER_3_HIGH_LEVEL',
        paradigms: ['OOP', 'Functional', 'Imperative'],
        domains: ['Web frontend', 'Node.js', 'Large-scale JS'],
        release_year: 2012,
        creator: 'Microsoft',
        strength: 'Optional typing for JavaScript, tooling'
      },
      'Lua': {
        tier: 'TIER_6_SPECIALIZED',
        layer: 'LAYER_3_HIGH_LEVEL',
        paradigms: ['Imperative', 'OOP', 'Functional'],
        domains: ['Game scripting', 'Embedded systems', 'Config files'],
        release_year: 1993,
        creator: 'PUC-Rio (Brazil)',
        strength: 'Small, fast, embeddable scripting'
      },
      'Groovy': {
        tier: 'TIER_6_SPECIALIZED',
        layer: 'LAYER_3_HIGH_LEVEL',
        paradigms: ['OOP', 'Functional', 'Dynamic'],
        domains: ['JVM scripting', 'Build automation (Gradle)', 'Testing'],
        release_year: 2003,
        creator: 'James Strachan',
        strength: 'JVM scripting, Gradle build system'
      },

      // TIER 7: SPECIALIZED DOMAINS
      'SQL': {
        tier: 'TIER_7_SPECIALIZED',
        layer: 'LAYER_4_VERY_HIGH_LEVEL',
        paradigms: ['Declarative', 'Set-oriented'],
        domains: ['Database queries', 'Data management'],
        release_year: 1974,
        creator: 'Donald Chamberlin, Raymond Boyce (IBM)',
        strength: 'Industry standard for data querying'
      },
      'GraphQL': {
        tier: 'TIER_7_SPECIALIZED',
        layer: 'LAYER_4_VERY_HIGH_LEVEL',
        paradigms: ['Declarative', 'Query language'],
        domains: ['API queries', 'GraphQL APIs'],
        release_year: 2015,
        creator: 'Facebook',
        strength: 'Flexible API querying, type system'
      },
      'Terraform': {
        tier: 'TIER_7_SPECIALIZED',
        layer: 'LAYER_4_VERY_HIGH_LEVEL',
        paradigms: ['Declarative', 'Infrastructure as Code'],
        domains: ['Cloud infrastructure', 'DevOps'],
        release_year: 2014,
        creator: 'HashiCorp',
        strength: 'Cloud-agnostic IaC, state management'
      },
      'YAML': {
        tier: 'TIER_7_SPECIALIZED',
        layer: 'LAYER_4_VERY_HIGH_LEVEL',
        paradigms: ['Declarative', 'Configuration'],
        domains: ['Configuration', 'Data serialization'],
        release_year: 2001,
        creator: 'Ingy döt Net, Evan Powell, Chris Evans',
        strength: 'Human-readable data serialization'
      },
      'Puppet': {
        tier: 'TIER_7_SPECIALIZED',
        layer: 'LAYER_4_VERY_HIGH_LEVEL',
        paradigms: ['Declarative', 'Configuration management'],
        domains: ['Infrastructure management', 'DevOps'],
        release_year: 2005,
        creator: 'Luke Kanies',
        strength: 'Infrastructure as Code, cross-platform'
      },
      'Ansible': {
        tier: 'TIER_7_SPECIALIZED',
        layer: 'LAYER_4_VERY_HIGH_LEVEL',
        paradigms: ['Imperative', 'Configuration automation'],
        domains: ['Infrastructure automation', 'DevOps'],
        release_year: 2012,
        creator: 'Michael DeHaan (Red Hat)',
        strength: 'Agentless automation, YAML playbooks'
      },

      // TIER 8: ESOTERIC & EXPERIMENTAL
      'Brainfuck': {
        tier: 'TIER_8_ESOTERIC',
        layer: 'LAYER_7_ESOTERIC',
        paradigms: ['Imperative', 'Turing tarpit'],
        domains: ['Code golf', 'Theoretical computing'],
        release_year: 1993,
        creator: 'Urban Müller',
        strength: 'Minimal instruction set (8 commands), Turing complete'
      },
      'Whitespace': {
        tier: 'TIER_8_ESOTERIC',
        layer: 'LAYER_7_ESOTERIC',
        paradigms: ['Imperative', 'Esoteric'],
        domains: ['Code golf', 'Steganography'],
        release_year: 2003,
        creator: 'Edwin Brady, Chris Morris',
        strength: 'Only whitespace (space, tab, newline)'
      },
      'LOLCODE': {
        tier: 'TIER_8_ESOTERIC',
        layer: 'LAYER_7_ESOTERIC',
        paradigms: ['Imperative', 'Humorous'],
        domains: ['Code golf', 'Joke programming'],
        release_year: 2007,
        creator: 'Adam Lindsay',
        strength: 'Cat meme language, Turing complete'
      },
      'Chef': {
        tier: 'TIER_8_ESOTERIC',
        layer: 'LAYER_7_ESOTERIC',
        paradigms: ['Imperative', 'Stack-based'],
        domains: ['Esoteric', 'Art'],
        release_year: 2002,
        creator: 'David Morgan-Mar',
        strength: 'Looks like cooking recipes'
      },
      'Shakespeare': {
        tier: 'TIER_8_ESOTERIC',
        layer: 'LAYER_7_ESOTERIC',
        paradigms: ['Imperative', 'Drama-based'],
        domains: ['Art', 'Esoteric'],
        release_year: 2001,
        creator: 'Jon Åslund, Karl Hasselström',
        strength: 'Reads like Shakespeare plays'
      },
      'Piet': {
        tier: 'TIER_8_ESOTERIC',
        layer: 'LAYER_7_ESOTERIC',
        paradigms: ['Visual', 'Stack-based'],
        domains: ['Visual programming', 'Art'],
        release_year: 1998,
        creator: 'David Morgan-Mar',
        strength: 'Programs look like abstract paintings'
      },
      'Malboge': {
        tier: 'TIER_8_ESOTERIC',
        layer: 'LAYER_7_ESOTERIC',
        paradigms: ['Imperative', 'Cryptic'],
        domains: ['Challenging', 'Turing tarpit'],
        release_year: 1998,
        creator: 'Ben Olmstead',
        strength: 'Intentionally difficult programming'
      },
      'Chicken': {
        tier: 'TIER_8_ESOTERIC',
        layer: 'LAYER_7_ESOTERIC',
        paradigms: ['Imperative', 'Minimalist'],
        domains: ['Esoteric', 'Minimal'],
        release_year: 2002,
        creator: 'Leif Sauermann',
        strength: 'Only "chicken" keyword'
      },

      // TIER 9: EDUCATIONAL
      'Scratch': {
        tier: 'TIER_9_EDUCATIONAL',
        layer: 'LAYER_4_VERY_HIGH_LEVEL',
        paradigms: ['Visual', 'Block-based', 'Imperative'],
        domains: ['Education', 'Introduction to programming', 'Children'],
        release_year: 2007,
        creator: 'MIT Media Lab',
        strength: 'Visual programming for beginners'
      },
      'Blockly': {
        tier: 'TIER_9_EDUCATIONAL',
        layer: 'LAYER_4_VERY_HIGH_LEVEL',
        paradigms: ['Visual', 'Block-based'],
        domains: ['Education', 'Robotics', 'IoT'],
        release_year: 2012,
        creator: 'Google',
        strength: 'Drag-and-drop programming blocks'
      },
      'Processing': {
        tier: 'TIER_9_EDUCATIONAL',
        layer: 'LAYER_3_HIGH_LEVEL',
        paradigms: ['Imperative', 'OOP', 'Creative'],
        domains: ['Art', 'Design', 'Data visualization', 'Education'],
        release_year: 2001,
        creator: 'Ben Fry, Casey Reas',
        strength: 'Creative coding, visual arts'
      },
      'Logo': {
        tier: 'TIER_9_EDUCATIONAL',
        layer: 'LAYER_4_VERY_HIGH_LEVEL',
        paradigms: ['Procedural', 'Functional', 'Turtle graphics'],
        domains: ['Education', 'Turtle graphics', 'Children'],
        release_year: 1967,
        creator: 'Seymour Papert',
        strength: 'Turtle graphics for learning geometry and logic'
      },
      'Alice': {
        tier: 'TIER_9_EDUCATIONAL',
        layer: 'LAYER_4_VERY_HIGH_LEVEL',
        paradigms: ['Visual', '3D', 'Object-oriented'],
        domains: ['Education', '3D animation', 'Introduction to OOP'],
        release_year: 1999,
        creator: 'Carnegie Mellon University',
        strength: '3D visual programming for education'
      }
    };

    // Register all languages
    Object.entries(languages).forEach(([lang_name, lang_data]) => {
      this.all_languages.set(lang_name, {
        name: lang_name,
        ...lang_data,
        registration_date: new Date().toISOString()
      });

      // Organize by layer
      const layer = lang_data.layer;
      if (!this.languages_by_layer.has(layer)) {
        this.languages_by_layer.set(layer, []);
      }
      this.languages_by_layer.get(layer).push(lang_name);

      // Organize by paradigm
      lang_data.paradigms.forEach(paradigm => {
        if (!this.languages_by_paradigm.has(paradigm)) {
          this.languages_by_paradigm.set(paradigm, []);
        }
        this.languages_by_paradigm.get(paradigm).push(lang_name);
      });

      // Organize by domain
      lang_data.domains.forEach(domain => {
        if (!this.languages_by_domain.has(domain)) {
          this.languages_by_domain.set(domain, []);
        }
        this.languages_by_domain.get(domain).push(lang_name);
      });

      this.total_languages_registered++;
    });

    console.log(`✅ Registered ${this.total_languages_registered} programming languages`);
  }

  /**
   * Register rare and niche systems
   */
  registerRareSystems() {
    const rare_systems = {
      'SPARK_Ada': {
        category: 'Formal Verification',
        description: 'SPARK is a formally specified subset of Ada designed for high-assurance systems',
        use_cases: ['Defense systems', 'Avionics', 'Critical safety systems'],
        formality_level: 'HIGHEST'
      },
      'Coq': {
        category: 'Proof Assistant',
        description: 'Interactive theorem prover and dependent type theory language',
        use_cases: ['Formal verification', 'Mathematical proofs', 'Certified software'],
        formality_level: 'HIGHEST'
      },
      'Agda': {
        category: 'Dependently Typed',
        description: 'Dependently typed functional language based on intuitionistic type theory',
        use_cases: ['Type theory research', 'Formal verification', 'Mathematical proofs'],
        formality_level: 'VERY_HIGH'
      },
      'Idris': {
        category: 'Dependently Typed',
        description: 'Dependently typed programming language with a Haskell-like syntax',
        use_cases: ['Type-driven development', 'Verified programming', 'Interactive theorem proving'],
        formality_level: 'VERY_HIGH'
      },
      'Lean': {
        category: 'Proof Assistant',
        description: 'Theorem prover and functional programming language',
        use_cases: ['Mathematical formalization', 'Verified software', 'Type theory'],
        formality_level: 'VERY_HIGH'
      },
      'TLA+': {
        category: 'Formal Specification',
        description: 'Formal language for specifying and reasoning about concurrent systems',
        use_cases: ['System design verification', 'Distributed systems', 'Concurrency verification'],
        formality_level: 'VERY_HIGH'
      },
      'Alloy': {
        category: 'Formal Modeling',
        description: 'Declarative language for describing and analyzing software models',
        use_cases: ['Software design analysis', 'Security verification', 'Model checking'],
        formality_level: 'HIGH'
      },
      'Z': {
        category: 'Formal Specification',
        description: 'Formal specification language using set theory and logic',
        use_cases: ['Formal specification', 'Requirements analysis', 'Software verification'],
        formality_level: 'VERY_HIGH'
      },
      'VDM': {
        category: 'Formal Method',
        description: 'Vienna Development Method for formal software development',
        use_cases: ['Formal verification', 'Safety-critical systems', 'Formal specification'],
        formality_level: 'VERY_HIGH'
      },
      'Promela': {
        category: 'Model Checking',
        description: 'Verification modeling language for SPIN model checker',
        use_cases: ['Protocol verification', 'Concurrent system verification', 'Model checking'],
        formality_level: 'HIGH'
      },
      'Temporal_Logic': {
        category: 'Logic',
        description: 'Logic for specifying properties of systems over time',
        use_cases: ['System verification', 'Temporal properties', 'Model checking'],
        formality_level: 'VERY_HIGH'
      },
      'APL': {
        category: 'Array Programming',
        description: 'Mathematical array programming language with unique syntax',
        use_cases: ['Mathematical computing', 'Financial modeling', 'Data analysis'],
        formality_level: 'VERY_MATHEMATICAL'
      },
      'J_Language': {
        category: 'Array Programming',
        description: 'Modern successor to APL, array-oriented programming',
        use_cases: ['Mathematical programming', 'Data manipulation', 'Scientific computing'],
        formality_level: 'VERY_MATHEMATICAL'
      },
      'Mathematica': {
        category: 'Symbolic Math',
        description: 'Symbolic mathematics system with programming language',
        use_cases: ['Mathematical computation', 'Symbolic manipulation', 'Scientific research'],
        formality_level: 'VERY_MATHEMATICAL'
      },
      'SAS': {
        category: 'Statistical',
        description: 'Software suite for statistical analysis and business intelligence',
        use_cases: ['Statistical analysis', 'Business analytics', 'Data mining'],
        formality_level: 'SPECIALIZED'
      },
      'Prolog': {
        category: 'Logic Programming',
        description: 'Logic programming language based on formal logic',
        use_cases: ['Symbolic AI', 'Expert systems', 'Knowledge representation'],
        formality_level: 'VERY_HIGH'
      },
      'Datalog': {
        category: 'Logic Programming',
        description: 'Declarative logic language, subset of Prolog',
        use_cases: ['Database queries', 'Program analysis', 'Knowledge graphs'],
        formality_level: 'VERY_HIGH'
      },
      'Mercury': {
        category: 'Logic Programming',
        description: 'Logic programming language with strong typing and higher-order predicates',
        use_cases: ['Formal specification', 'High-performance logic programming'],
        formality_level: 'VERY_HIGH'
      },
      'VHDL': {
        category: 'Hardware Description',
        description: 'Very High Speed Integrated Circuit Hardware Description Language',
        use_cases: ['Digital circuit design', 'FPGA programming', 'Hardware verification'],
        formality_level: 'SPECIALIZED'
      },
      'Verilog': {
        category: 'Hardware Description',
        description: 'Hardware description language for digital systems',
        use_cases: ['Digital design', 'FPGA programming', 'Chip design'],
        formality_level: 'SPECIALIZED'
      },
      'GLSL': {
        category: 'GPU Programming',
        description: 'OpenGL Shading Language for GPU programming',
        use_cases: ['Graphics programming', 'Shader development', '3D rendering'],
        formality_level: 'SPECIALIZED'
      },
      'HLSL': {
        category: 'GPU Programming',
        description: 'High Level Shading Language by Microsoft',
        use_cases: ['DirectX graphics', 'Shader programming', 'Game development'],
        formality_level: 'SPECIALIZED'
      },
      'CUDA': {
        category: 'GPU Programming',
        description: 'Compute Unified Device Architecture for GPU computing',
        use_cases: ['GPU acceleration', 'Parallel computing', 'Deep learning'],
        formality_level: 'SPECIALIZED'
      },
      'OpenCL': {
        category: 'GPU Programming',
        description: 'Open Computing Language for heterogeneous computing',
        use_cases: ['GPU acceleration', 'Heterogeneous computing', 'Parallel computing'],
        formality_level: 'SPECIALIZED'
      }
    };

    Object.entries(rare_systems).forEach(([system_name, system_data]) => {
      this.rare_systems.set(system_name, {
        name: system_name,
        ...system_data,
        registration_date: new Date().toISOString(),
        rarity_level: 'RARE'
      });
    });

    console.log(`✅ Registered ${this.rare_systems.size} rare and formal systems`);
  }

  /**
   * Register specialized domain systems
   */
  registerSpecializedSystems() {
    const specialized = {
      'Make': {
        domain: 'Build Systems',
        type: 'Build automation',
        purpose: 'Build system that uses makefiles to specify compilation rules'
      },
      'CMake': {
        domain: 'Build Systems',
        type: 'Cross-platform build generator',
        purpose: 'Generate native build system files from CMakeLists.txt'
      },
      'Gradle': {
        domain: 'Build Systems',
        type: 'Build automation',
        purpose: 'Polyglot build automation with Groovy DSL'
      },
      'Bazel': {
        domain: 'Build Systems',
        type: 'Distributed build system',
        purpose: 'Fast, scalable, multilanguage build system by Google'
      },
      'nginx_config': {
        domain: 'Web Servers',
        type: 'Configuration language',
        purpose: 'Configuration for nginx web server'
      },
      'Apache_httpd_config': {
        domain: 'Web Servers',
        type: 'Configuration language',
        purpose: 'Configuration for Apache HTTP Server'
      },
      'Docker_Compose': {
        domain: 'Container Orchestration',
        type: 'Configuration',
        purpose: 'Define multi-container Docker applications'
      },
      'Kubernetes_YAML': {
        domain: 'Container Orchestration',
        type: 'Configuration',
        purpose: 'Define Kubernetes resources and deployments'
      },
      'JSON': {
        domain: 'Data Serialization',
        type: 'Data format',
        purpose: 'JavaScript Object Notation for data interchange'
      },
      'XML': {
        domain: 'Data Serialization',
        type: 'Markup',
        purpose: 'eXtensible Markup Language for structured data'
      },
      'Protocol_Buffers': {
        domain: 'Data Serialization',
        type: 'Message format',
        purpose: 'Efficient serialization by Google for structured data'
      },
      'MessagePack': {
        domain: 'Data Serialization',
        type: 'Message format',
        purpose: 'Efficient binary serialization format'
      },
      'Avro': {
        domain: 'Data Serialization',
        type: 'Data serialization',
        purpose: 'Row-oriented remote procedure call and data serialization'
      },
      'Thrift': {
        domain: 'Data Serialization',
        type: 'RPC framework',
        purpose: 'Software framework for cross-language RPC'
      },
      'gRPC': {
        domain: 'RPC Frameworks',
        type: 'RPC protocol',
        purpose: 'High-performance RPC framework using Protocol Buffers'
      },
      'REST_API': {
        domain: 'API Design',
        type: 'Architectural style',
        purpose: 'Representational State Transfer for web APIs'
      },
      'OpenAPI': {
        domain: 'API Specification',
        type: 'API specification format',
        purpose: 'Standard for describing REST APIs'
      },
      'GraphQL_Schema': {
        domain: 'API Specification',
        type: 'Schema definition',
        purpose: 'Type system for GraphQL APIs'
      },
      'CSS': {
        domain: 'Web Styling',
        type: 'Style sheet language',
        purpose: 'Cascading Style Sheets for web styling'
      },
      'HTML': {
        domain: 'Web Markup',
        type: 'Markup language',
        purpose: 'HyperText Markup Language for web pages'
      },
      'Sass': {
        domain: 'Web Styling',
        type: 'CSS preprocessor',
        purpose: 'Syntactically Awesome Style Sheets for enhanced CSS'
      },
      'Less': {
        domain: 'Web Styling',
        type: 'CSS preprocessor',
        purpose: 'Leaner Style Sheets, CSS preprocessor'
      },
      'PostCSS': {
        domain: 'Web Styling',
        type: 'CSS transformer',
        purpose: 'Transform CSS with JavaScript plugins'
      }
    };

    Object.entries(specialized).forEach(([system_name, system_data]) => {
      this.specialized_systems.set(system_name, {
        name: system_name,
        ...system_data,
        registration_date: new Date().toISOString()
      });
    });

    console.log(`✅ Registered ${this.specialized_systems.size} specialized systems`);
  }

  /**
   * Get all languages
   */
  getAllLanguages() {
    return Array.from(this.all_languages.values());
  }

  /**
   * Get languages by layer
   */
  getLanguagesByLayer(layer) {
    return this.languages_by_layer.get(layer) || [];
  }

  /**
   * Get languages by paradigm
   */
  getLanguagesByParadigm(paradigm) {
    return this.languages_by_paradigm.get(paradigm) || [];
  }

  /**
   * Get languages by domain
   */
  getLanguagesByDomain(domain) {
    return this.languages_by_domain.get(domain) || [];
  }

  /**
   * Get rare systems
   */
  getRareSystems() {
    return Array.from(this.rare_systems.values());
  }

  /**
   * Get specialized systems
   */
  getSpecializedSystems() {
    return Array.from(this.specialized_systems.values());
  }

  /**
   * Get universe statistics
   */
  getUniverseStatistics() {
    return {
      total_general_languages: this.all_languages.size,
      total_rare_systems: this.rare_systems.size,
      total_specialized_systems: this.specialized_systems.size,
      total_registered: this.all_languages.size + this.rare_systems.size + this.specialized_systems.size,
      layers_count: this.languages_by_layer.size,
      paradigms_count: this.languages_by_paradigm.size,
      domains_count: this.languages_by_domain.size,
      layers: Array.from(this.languages_by_layer.keys()),
      paradigms: Array.from(this.languages_by_paradigm.keys()),
      domains: Array.from(this.languages_by_domain.keys())
    };
  }
}

// Singleton instance
let instance = null;

module.exports = {
  getInstance: () => {
    if (!instance) {
      instance = new SheikhaExpandedLanguagesUniverse();
      instance.initializeUniverse();
    }
    return instance;
  },

  getAllLanguages: () => module.exports.getInstance().getAllLanguages(),
  getLanguagesByLayer: (layer) => module.exports.getInstance().getLanguagesByLayer(layer),
  getLanguagesByParadigm: (paradigm) => module.exports.getInstance().getLanguagesByParadigm(paradigm),
  getLanguagesByDomain: (domain) => module.exports.getInstance().getLanguagesByDomain(domain),
  getRareSystems: () => module.exports.getInstance().getRareSystems(),
  getSpecializedSystems: () => module.exports.getInstance().getSpecializedSystems(),
  getUniverseStatistics: () => module.exports.getInstance().getUniverseStatistics()
};
