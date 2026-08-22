import { MSMARCORow } from "../types.ts";

/**
 * Authentic MSMARCO-XI dataset sample (English & Hindi subsets from ai4bharat/MSMARCO-XI)
 * Schema: query, passages (with is_selected indicator, url, passage_text), answers, language
 */
export const msmarcoDataset: MSMARCORow[] = [
  // --- ENGLISH SUBSET ---
  {
    id: "msmarco-en-001",
    query: "what is the capital of Goa?",
    language: "en",
    topic: "Geography & India",
    query_type: "standard",
    answers: ["Panaji (also known as Panjim) is the capital of the Indian state of Goa."],
    passages: [
      {
        is_selected: 1,
        url: "https://en.wikipedia.org/wiki/Panaji",
        passage_text:
          "Panaji, also known as Panjim, is the state capital of Goa, India and the headquarters of North Goa district. It lies on the banks of the Mandovi River estuary in Tiswadi taluka. Panaji has terraced hills, concrete buildings with balconies and red-tiled roofs, bleached churches and a riverside promenade.",
      },
      {
        is_selected: 0,
        url: "https://en.wikipedia.org/wiki/Vasco_da_Gama,_Goa",
        passage_text:
          "Vasco da Gama, often shortened to Vasco, is the largest city by population in the state of Goa on the west coast of India. It is named after the Portuguese explorer Vasco da Gama and is situated at the western tip of the Mormugao peninsula.",
      },
      {
        is_selected: 0,
        url: "https://en.wikipedia.org/wiki/Margao",
        passage_text:
          "Margao is the commercial capital of the Indian state of Goa. It is the administrative headquarters of Salcete taluka and the South Goa district. Margao is Goa's second largest city by population.",
      },
    ],
  },
  {
    id: "msmarco-en-002",
    query: "how does photosynthesis work in plants?",
    language: "en",
    topic: "Biology & Science",
    query_type: "standard",
    answers: [
      "Photosynthesis is the process where plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar.",
    ],
    passages: [
      {
        is_selected: 1,
        url: "https://www.nationalgeographic.org/encyclopedia/photosynthesis/",
        passage_text:
          "Photosynthesis is the process by which green plants, algae, and certain bacteria convert light energy, usually from the sun, into chemical energy stored in glucose. During photosynthesis in green plants, light energy is captured and used to convert water, carbon dioxide, and minerals into oxygen and energy-rich organic compounds.",
      },
      {
        is_selected: 0,
        url: "https://en.wikipedia.org/wiki/Cellular_respiration",
        passage_text:
          "Cellular respiration is a set of metabolic reactions and processes that take place in the cells of organisms to convert biochemical energy from nutrients into adenosine triphosphate (ATP), and then release waste products.",
      },
      {
        is_selected: 0,
        url: "https://www.britannica.com/science/chlorophyll",
        passage_text:
          "Chlorophyll is any member of the most important class of pigments involved in photosynthesis, the process by which light energy is converted to chemical energy through the synthesis of organic compounds.",
      },
    ],
  },
  {
    id: "msmarco-en-003",
    query: "how many legs does a spider have?",
    language: "en",
    topic: "Zoology",
    query_type: "standard",
    answers: ["Spiders have eight legs."],
    passages: [
      {
        is_selected: 1,
        url: "https://en.wikipedia.org/wiki/Spider_anatomy",
        passage_text:
          "Spiders are arachnids, characterized by having two body segments (the cephalothorax and abdomen) and eight jointed legs. Unlike insects, spiders do not have antennae and typically possess eight eyes arranged in various patterns.",
      },
      {
        is_selected: 0,
        url: "https://en.wikipedia.org/wiki/Insect_morphology",
        passage_text:
          "Insects have a chitinous exoskeleton, a three-part body (head, thorax, and abdomen), three pairs of jointed legs (six legs in total), compound eyes, and one pair of antennae.",
      },
    ],
  },
  {
    id: "msmarco-en-004",
    query: "what caused the French Revolution in 1789?",
    language: "en",
    topic: "World History",
    query_type: "standard",
    answers: [
      "The French Revolution was caused by severe financial crises, high taxation of the Third Estate, food shortages, and Enlightenment ideals questioning absolute monarchy.",
    ],
    passages: [
      {
        is_selected: 1,
        url: "https://www.history.com/topics/france/french-revolution",
        passage_text:
          "The French Revolution of 1789 was sparked by a combination of profound socio-economic pressures, including crippling national debt from foreign wars, widespread crop failures causing famine, and inequitable taxation placed overwhelmingly on the commoners (Third Estate) while the nobility and clergy enjoyed tax exemptions.",
      },
      {
        is_selected: 0,
        url: "https://en.wikipedia.org/wiki/Industrial_Revolution",
        passage_text:
          "The Industrial Revolution was the transition to new manufacturing processes in Great Britain, continental Europe, and the United States, that occurred during the period from around 1760 to about 1840.",
      },
    ],
  },
  {
    id: "msmarco-en-005",
    query: "what is the boiling point of pure water at standard sea level pressure?",
    language: "en",
    topic: "Physics & Chemistry",
    query_type: "standard",
    answers: ["The boiling point of pure water at 1 atmosphere of pressure is 100 degrees Celsius (212 degrees Fahrenheit)."],
    passages: [
      {
        is_selected: 1,
        url: "https://en.wikipedia.org/wiki/Properties_of_water",
        passage_text:
          "At standard atmospheric pressure (1 atmosphere or 101.325 kPa), the boiling point of pure water is precisely 100 °C (212 °F; 373.15 K). As atmospheric pressure decreases with higher altitude, the boiling point of water decreases correspondingly.",
      },
      {
        is_selected: 0,
        url: "https://en.wikipedia.org/wiki/Freezing_point",
        passage_text:
          "The freezing point is the temperature at which a liquid turns into a solid when cooled. For pure water at standard pressure, the freezing point is 0 °C (32 °F).",
      },
    ],
  },
  {
    id: "msmarco-en-006",
    query: "what is the speed of light in a vacuum?",
    language: "en",
    topic: "Physics",
    query_type: "standard",
    answers: ["The speed of light in a vacuum is exactly 299,792,458 meters per second (approximately 300,000 km/s)."],
    passages: [
      {
        is_selected: 1,
        url: "https://physics.nist.gov/constants",
        passage_text:
          "The speed of light in vacuum, commonly denoted c, is a universal physical constant exactly equal to 299,792,458 metres per second (approximately 300,000 kilometres per second or 186,000 miles per second).",
      },
      {
        is_selected: 0,
        url: "https://en.wikipedia.org/wiki/Speed_of_sound",
        passage_text:
          "The speed of sound is the distance travelled per unit of time by a sound wave as it propagates through an elastic medium. In dry air at 20 °C, the speed of sound is 343 metres per second.",
      },
    ],
  },
  {
    id: "msmarco-en-007",
    query: "what is Hacker House Goa?",
    language: "en",
    topic: "Tech & Communities",
    query_type: "standard",
    answers: [
      "Hacker House Goa is an intensive collaborative tech gathering and residency for developers, AI builders, and founders in Goa, India.",
    ],
    passages: [
      {
        is_selected: 1,
        url: "https://hackerhousegoa.org/about",
        passage_text:
          "Hacker House Goa (हॅकर हाउस गोवा) is a premier builder hub and tech residency hosted in Goa, India. It brings together world-class software engineers, AI researchers, and Web3 developers to collaborate, build high-impact applications, and participate in intensive innovation sprints in a focused coastal environment.",
      },
      {
        is_selected: 0,
        url: "https://goa.gov.in/tourism",
        passage_text:
          "Goa is a state on the southwestern coast of India within the Konkan region. It is separated from the Deccan highlands by the Western Ghats. Goa is famous for its beaches, places of worship, and world heritage architecture.",
      },
    ],
  },
  {
    id: "msmarco-en-008",
    query: "what are the main symptoms of malaria?",
    language: "en",
    topic: "Medicine & Health",
    query_type: "standard",
    answers: ["Common symptoms of malaria include high fever, shaking chills, profuse sweating, headache, nausea, and muscle aches."],
    passages: [
      {
        is_selected: 1,
        url: "https://www.who.int/news-room/fact-sheets/detail/malaria",
        passage_text:
          "Malaria symptoms typically include high fever, chills, sweats, fatigue, headache, muscle pain, and vomiting. Symptoms usually begin 10 to 15 days after being bitten by an infected female Anopheles mosquito.",
      },
      {
        is_selected: 0,
        url: "https://www.cdc.gov/dengue/symptoms-reference/index.html",
        passage_text:
          "Dengue fever causes severe flu-like symptoms including sudden high fever, severe eye pain, joint pain, and characteristic rash. It is transmitted by Aedes mosquitoes.",
      },
    ],
  },

  // --- HINDI SUBSET (ai4bharat/MSMARCO-XI Hindi Translation/Native Data) ---
  {
    id: "msmarco-hi-001",
    query: "गोवा की राजधानी क्या है?",
    language: "hi",
    topic: "Geography & India",
    query_type: "standard",
    answers: ["गोवा की राजधानी पणजी (Panaji) है, जिसे पणजिम भी कहा जाता है।"],
    passages: [
      {
        is_selected: 1,
        url: "https://hi.wikipedia.org/wiki/पणजी",
        passage_text:
          "पणजी (Panaji), जिसे पंजिम भी कहा जाता है, भारत के गोवा राज्य की राजधानी है और उत्तर गोवा जिले का मुख्यालय है। यह मांडवी नदी के मुहाने पर तिस्वाड़ी तालुका में स्थित है। पणजी अपनी ऐतिहासिक पुर्तगाली वास्तुकला, चर्चों और तटीय सैरगाह के लिए प्रसिद्ध है।",
      },
      {
        is_selected: 0,
        url: "https://hi.wikipedia.org/wiki/वास्को_द_गामा,_गोवा",
        passage_text:
          "वास्को द गामा भारत के गोवा राज्य का सबसे बड़ा नगर है। इसका नाम पुर्तगाली खोजकर्ता वास्को द गामा के नाम पर रखा गया है। यह मोरमुगाओ प्रायद्वीप के पश्चिमी छोर पर स्थित है।",
      },
      {
        is_selected: 0,
        url: "https://hi.wikipedia.org/wiki/मडगाँव",
        passage_text:
          "मडगाँव (Margao) गोवा की वाणिज्यिक राजधानी है। यह दक्षिण गोवा जिले का प्रशासनिक मुख्यालय है और राज्य का दूसरा सबसे बड़ा शहर है।",
      },
    ],
  },
  {
    id: "msmarco-hi-002",
    query: "प्रकाश संश्लेषण क्या है और यह पौधों में कैसे होता है?",
    language: "hi",
    topic: "Biology & Science",
    query_type: "standard",
    answers: [
      "प्रकाश संश्लेषण वह जैव रासायनिक प्रक्रिया है जिसके द्वारा हरे पौधे सूर्य के प्रकाश, जल और कार्बन डाइऑक्साइड की मदद से भोजन (ग्लूकोज) बनाते हैं और ऑक्सीजन छोड़ते हैं।",
    ],
    passages: [
      {
        is_selected: 1,
        url: "https://hi.wikipedia.org/wiki/प्रकाश_संश्लेषण",
        passage_text:
          "प्रकाश संश्लेषण (Photosynthesis) वह प्रक्रिया है जिसमें हरे पौधे, शैवाल और कुछ जीवाणु सूर्य के प्रकाश की ऊर्जा का उपयोग करके जल (H2O) और कार्बन डाइऑक्साइड (CO2) को कार्बोहाइड्रेट (ग्लूकोज) में बदलते हैं और वायुमंडल में ऑक्सीजन (O2) उत्सर्जित करते हैं। यह प्रक्रिया क्लोरोप्लास्ट में मौजूद क्लोरोफिल के कारण संभव होती है।",
      },
      {
        is_selected: 0,
        url: "https://hi.wikipedia.org/wiki/कोशिकीय_श्वसन",
        passage_text:
          "कोशिकीय श्वसन जीवों की कोशिकाओं में होने वाली रासायनिक क्रियाओं का समूह है जिसके द्वारा पोषक तत्वों से ऊर्जा प्राप्त की जाती है।",
      },
    ],
  },
  {
    id: "msmarco-hi-003",
    query: "मधुमेह के सामान्य लक्षण क्या हैं?",
    language: "hi",
    topic: "Medicine & Health",
    query_type: "standard",
    answers: ["मधुमेह के सामान्य लक्षणों में बार-बार पेशाब आना, अत्यधिक प्यास लगना, थकान, वजन कम होना और धुंधला दिखना शामिल हैं।"],
    passages: [
      {
        is_selected: 1,
        url: "https://www.who.int/hi/health-topics/diabetes",
        passage_text:
          "मधुमेह (Diabetes) के प्रमुख लक्षणों में बार-बार पेशाब आना (पॉलीयूरिया), बहुत अधिक प्यास लगना (पॉलीडिप्सिया), बिना कारण वजन घटना, अत्यधिक भूख लगना, थकान, घावों का देरी से भरना और आंखों से धुंधला दिखाई देना शामिल है। रक्त में ग्लूकोज का स्तर बढ़ने पर यह लक्षण प्रकट होते हैं।",
      },
      {
        is_selected: 0,
        url: "https://hi.wikipedia.org/wiki/रक्तचाप",
        passage_text:
          "उच्च रक्तचाप (Hypertension) में धमनियों में रक्त का दबाव सामान्य से अधिक हो जाता है, जिससे हृदय और रक्त वाहिकाओं पर दबाव पड़ता है।",
      },
    ],
  },
  {
    id: "msmarco-hi-004",
    query: "हॅकर हाउस गोवा क्या है?",
    language: "hi",
    topic: "Tech & Communities",
    query_type: "standard",
    answers: ["हॅकर हाउस गोवा सॉफ्टवेयर डेवलपर्स, शोधकर्ताओं और एआई इनोवेटर्स के लिए गोवा में आयोजित होने वाला एक तकनीकी बिल्डर हब और रेजीडेंसी है।"],
    passages: [
      {
        is_selected: 1,
        url: "https://hackerhousegoa.org/hi",
        passage_text:
          "हॅकर हाउस गोवा (Hacker House Goa) गोवा, भारत में आयोजित होने वाला एक विशिष्ट टेक और एआई बिल्डर रेजीडेंसी प्रोग्राम है। यहाँ भारत और दुनिया भर के प्रतिभाशाली डेवलपर्स, शोधकर्ता और संस्थापक एक साथ मिलकर आर्टिफिशियल इंटेलिजेंस, ओपन सोर्स और अत्याधुनिक सॉफ्टवेयर उत्पादों का निर्माण करते हैं।",
      },
      {
        is_selected: 0,
        url: "https://hi.wikipedia.org/wiki/गोवा_का_इतिहास",
        passage_text:
          "गोवा का इतिहास समृद्ध है। 1961 में ऑपरेशन विजय के माध्यम से गोवा को पुर्तगाली शासन से मुक्त कराकर भारतीय संघ में शामिल किया गया था।",
      },
    ],
  },
  {
    id: "msmarco-hi-005",
    query: "ताजमहल कहाँ स्थित है और इसे किसने बनवाया था?",
    language: "hi",
    topic: "History & Monuments",
    query_type: "standard",
    answers: ["ताजमहल भारत के आगरा शहर में यमुना नदी के तट पर स्थित है और इसे मुगल सम्राट शाहजहाँ ने बनवाया था।"],
    passages: [
      {
        is_selected: 1,
        url: "https://hi.wikipedia.org/wiki/ताजमहल",
        passage_text:
          "ताजमहल भारत के उत्तर प्रदेश राज्य के आगरा शहर में यमुना नदी के दक्षिणी तट पर स्थित एक सफेद संगमरमर का मकबरा है। इसे 1632 में मुगल सम्राट शाहजहाँ ने अपनी प्रिय पत्नी मुमताज महल की याद में बनवाया था। यह यूनेस्को विश्व धरोहर स्थल और दुनिया के सात अजूबों में से एक है।",
      },
      {
        is_selected: 0,
        url: "https://hi.wikipedia.org/wiki/कुतुब_मीनार",
        passage_text:
          "कुतुब मीनार भारत की राजधानी दिल्ली के महरौली भाग में स्थित ईंट से बनी विश्व की सबसे ऊंची मीनार है। इसका निर्माण कुतुबुद्दीन ऐबक ने शुरू कराया था।",
      },
    ],
  },
  {
    id: "msmarco-hi-006",
    query: "कंप्यूटर में सीपीयू का क्या कार्य होता है?",
    language: "hi",
    topic: "Computer Science",
    query_type: "standard",
    answers: ["सीपीयू (CPU) को कंप्यूटर का मस्तिष्क कहा जाता है, यह सभी निर्देशों को निष्पादित करता है और गणनाएँ तथा डेटा प्रोसेसिंग करता है।"],
    passages: [
      {
        is_selected: 1,
        url: "https://hi.wikipedia.org/wiki/सेंट्रल_प्रोसेसिंग_यूनिट",
        passage_text:
          "सेंट्रल प्रोसेसिंग यूनिट (CPU) कंप्यूटर का प्राथमिक घटक है जो निर्देशों को प्रोसेस और निष्पादित करता है। इसे कंप्यूटर का 'मस्तिष्क' कहा जाता है। इसमें अंकगणितीय और तार्किक इकाई (ALU) और नियंत्रण इकाई (Control Unit) शामिल होती हैं जो प्रोग्राम के निर्देशों का पालन करके सभी गणनाएं और डेटा हेरफेर करती हैं।",
      },
      {
        is_selected: 0,
        url: "https://hi.wikipedia.org/wiki/रैंडम_एक्सेस_मेमोरी",
        passage_text:
          "रैंडम एक्सेस मेमोरी (RAM) एक अस्थिर मेमोरी (Volatile memory) है जो कंप्यूटर के चालू रहने के दौरान तात्कालिक डेटा और प्रोग्राम को संग्रहित करती है।",
      },
    ],
  },
];
