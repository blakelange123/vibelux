'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Users, 
  Building, 
  Home, 
  Briefcase,
  Crown,
  Sparkles
} from 'lucide-react';

interface QuizAnswer {
  question: string;
  answer: string;
  score: {
    free: number;
    hobbyist: number;
    professional: number;
    business: number;
    enterprise: number;
  };
}

interface QuizOption {
  text: string;
  value: string;
  scores: {
    free: number;
    hobbyist: number;
    professional: number;
    business: number;
    enterprise: number;
  };
}

interface QuizQuestion {
  id: number;
  question: string;
  subtitle: string;
  options: QuizOption[];
}

interface TierRecommendation {
  id: string;
  name: string;
  price: string;
  description: string;
  icon: any;
  color: string;
  features: string[];
  confidence: number;
}

const questions: QuizQuestion[] = [
  {
    id: 1,
    question: "What's your current situation with lighting design?",
    subtitle: "Help us understand where you're starting from",
    options: [
      { 
        text: "I'm new to lighting design and want to learn the basics", 
        value: "Just getting started with grow lighting concepts",
        scores: { free: 5, hobbyist: 2, professional: 0, business: 0, enterprise: 0 }
      },
      { 
        text: "I use online calculators and guess-and-check methods", 
        value: "Could save 5-10 hours per project with better tools",
        scores: { free: 2, hobbyist: 5, professional: 2, business: 0, enterprise: 0 }
      },
      { 
        text: "I use AutoCAD + manual calculations for client projects", 
        value: "Could save 10-20 hours per project with specialized tools",
        scores: { free: 0, hobbyist: 1, professional: 5, business: 2, enterprise: 0 }
      },
      { 
        text: "I manage lighting for commercial growing operations", 
        value: "Energy optimization could save $50K-200K annually",
        scores: { free: 0, hobbyist: 0, professional: 2, business: 5, enterprise: 3 }
      },
      { 
        text: "I oversee multiple facilities and need centralized control", 
        value: "Operational efficiency could save $500K+ annually",
        scores: { free: 0, hobbyist: 0, professional: 1, business: 2, enterprise: 5 }
      }
    ]
  },
  {
    id: 2,
    question: "What's your biggest challenge right now?",
    subtitle: "Let's identify what's costing you the most time or money",
    options: [
      { 
        text: "Understanding basic lighting concepts and calculations", 
        value: "Learning costs: $500-2000 in courses/books",
        scores: { free: 5, hobbyist: 3, professional: 0, business: 0, enterprise: 0 }
      },
      { 
        text: "Designing layouts takes too long with current tools", 
        value: "Time savings worth: $2,000-5,000 annually",
        scores: { free: 1, hobbyist: 4, professional: 4, business: 2, enterprise: 1 }
      },
      { 
        text: "Clients want professional reports and 3D visualizations", 
        value: "Higher project rates: +$1,000-3,000 per project",
        scores: { free: 0, hobbyist: 1, professional: 5, business: 3, enterprise: 1 }
      },
      { 
        text: "High energy costs are killing our profit margins", 
        value: "Energy waste costs: $50,000-500,000 annually",
        scores: { free: 0, hobbyist: 0, professional: 2, business: 5, enterprise: 4 }
      },
      { 
        text: "Managing multiple facilities without real-time visibility", 
        value: "Operational inefficiencies: $500K-2M annually",
        scores: { free: 0, hobbyist: 0, professional: 1, business: 3, enterprise: 5 }
      }
    ]
  },
  {
    id: 3,
    question: "How much would solving this problem be worth to you?",
    subtitle: "Think about time saved, revenue gained, or costs avoided",
    options: [
      { 
        text: "Personal satisfaction and learning - no direct monetary value", 
        value: "Educational value: Priceless",
        scores: { free: 5, hobbyist: 3, professional: 0, business: 0, enterprise: 0 }
      },
      { 
        text: "$100-500 per month in time savings or efficiency", 
        value: "ROI target: Break even at $20-50/month",
        scores: { free: 2, hobbyist: 5, professional: 2, business: 0, enterprise: 0 }
      },
      { 
        text: "$1,000-5,000 per month in higher project rates or efficiency", 
        value: "ROI target: Break even at $100-200/month",
        scores: { free: 0, hobbyist: 2, professional: 5, business: 3, enterprise: 1 }
      },
      { 
        text: "$5,000-25,000 per month in energy savings or efficiency", 
        value: "ROI target: Break even at $500-1,000/month",
        scores: { free: 0, hobbyist: 0, professional: 2, business: 5, enterprise: 3 }
      },
      { 
        text: "$25,000+ per month in operational savings", 
        value: "ROI target: Break even at $2,000+/month",
        scores: { free: 0, hobbyist: 0, professional: 1, business: 3, enterprise: 5 }
      }
    ]
  },
  {
    id: 4,
    question: "What would make this a no-brainer purchase for you?",
    subtitle: "What specific outcome would justify the investment?",
    options: [
      { 
        text: "Free access to learn and experiment", 
        value: "Risk-free learning with professional tools",
        scores: { free: 5, hobbyist: 2, professional: 0, business: 0, enterprise: 0 }
      },
      { 
        text: "Save 10+ hours per month on design work", 
        value: "Time = money: $500-2,000 monthly savings",
        scores: { free: 1, hobbyist: 5, professional: 3, business: 1, enterprise: 0 }
      },
      { 
        text: "Professional reports that help me charge 20-50% more", 
        value: "Revenue increase: $1,000-5,000 per project",
        scores: { free: 0, hobbyist: 1, professional: 5, business: 2, enterprise: 1 }
      },
      { 
        text: "Reduce energy costs by 15-30% across our facilities", 
        value: "Annual savings: $50,000-500,000",
        scores: { free: 0, hobbyist: 0, professional: 2, business: 5, enterprise: 4 }
      },
      { 
        text: "Real-time monitoring and automation saving staff time", 
        value: "Labor + efficiency savings: $500K-2M annually",
        scores: { free: 0, hobbyist: 0, professional: 1, business: 3, enterprise: 5 }
      }
    ]
  },
  {
    id: 5,
    question: "What's your timeline for implementing a solution?",
    subtitle: "How urgently do you need to solve this problem?",
    options: [
      { 
        text: "No rush - just exploring and learning", 
        value: "Perfect time to start with free tools",
        scores: { free: 5, hobbyist: 2, professional: 1, business: 0, enterprise: 0 }
      },
      { 
        text: "Within the next 3-6 months for upcoming projects", 
        value: "Good runway to learn and implement",
        scores: { free: 2, hobbyist: 4, professional: 3, business: 1, enterprise: 0 }
      },
      { 
        text: "Next 30-90 days - have clients waiting", 
        value: "Need immediate productivity gains",
        scores: { free: 0, hobbyist: 2, professional: 5, business: 3, enterprise: 1 }
      },
      { 
        text: "ASAP - energy costs are hurting us right now", 
        value: "Every month of delay costs thousands",
        scores: { free: 0, hobbyist: 0, professional: 2, business: 5, enterprise: 4 }
      },
      { 
        text: "Immediate - need board-level reporting and oversight", 
        value: "Critical business need requiring enterprise solution",
        scores: { free: 0, hobbyist: 0, professional: 1, business: 3, enterprise: 5 }
      }
    ]
  },
  {
    id: 6,
    question: "How do you prefer to evaluate new software?",
    subtitle: "What's your decision-making process?",
    options: [
      { 
        text: "Try it free first, then consider paying if it's valuable", 
        value: "Free trial → upgrade path",
        scores: { free: 5, hobbyist: 4, professional: 2, business: 1, enterprise: 0 }
      },
      { 
        text: "Start small and affordable, scale up as I grow", 
        value: "Low-risk entry point with growth potential",
        scores: { free: 2, hobbyist: 5, professional: 4, business: 2, enterprise: 1 }
      },
      { 
        text: "Need to see clear ROI calculation before committing", 
        value: "Professional tools that pay for themselves",
        scores: { free: 0, hobbyist: 2, professional: 5, business: 4, enterprise: 2 }
      },
      { 
        text: "Willing to invest in comprehensive solution for major savings", 
        value: "Higher investment for bigger returns",
        scores: { free: 0, hobbyist: 1, professional: 3, business: 5, enterprise: 4 }
      },
      { 
        text: "Need enterprise features, support, and custom development", 
        value: "Mission-critical solution with full support",
        scores: { free: 0, hobbyist: 0, professional: 1, business: 3, enterprise: 5 }
      }
    ]
  }
];

const tiers: TierRecommendation[] = [
  {
    id: 'free',
    name: 'Free Explorer',
    price: 'Free Forever',
    description: 'Start learning grow lighting fundamentals',
    icon: Sparkles,
    color: 'gray',
    features: [
      '✅ Save $500-2,000 on lighting courses',
      '✅ Learn from professional-grade tools',
      '✅ Access to basic calculators and fixture database',
      '✅ Community support and educational resources',
      '✅ Risk-free way to explore grow lighting'
    ],
    confidence: 0
  },
  {
    id: 'hobbyist',
    name: 'Hobbyist',
    price: '$19/month',
    description: 'Save 5-10 hours per project with advanced tools',
    icon: Home,
    color: 'green',
    features: [
      '💰 Pays for itself: Save $500-2,000 monthly in time',
      '⚡ Advanced calculators reduce design time by 70%',
      '📱 Mobile access for on-the-go calculations',
      '🎯 500+ DLC fixtures for optimal selections',
      '📊 Interactive charts for better decisions'
    ],
    confidence: 0
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$199/month',
    description: 'Charge 20-50% more with professional deliverables',
    icon: Briefcase,
    color: 'purple',
    features: [
      '💰 ROI: Increase project rates by $1,000-5,000',
      '🤖 AI design assistant saves 10-20 hours per project',
      '📈 Professional reports justify higher fees',
      '👥 Team collaboration increases capacity',
      '🔬 Statistical analysis for research-grade results'
    ],
    confidence: 0
  },
  {
    id: 'business',
    name: 'Business',
    price: '$599/month',
    description: 'Reduce energy costs by 15-30% across facilities',
    icon: Building,
    color: 'blue',
    features: [
      '💰 ROI: Save $50K-500K annually in energy costs',
      '⚡ Real-time monitoring prevents costly downtime',
      '📊 Predictive maintenance reduces repair costs',
      '🏭 Multi-site management improves efficiency',
      '📞 Phone support minimizes operational delays'
    ],
    confidence: 0
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$1,999/month',
    description: 'Optimize operations worth $500K-2M in annual savings',
    icon: Crown,
    color: 'emerald',
    features: [
      '💰 ROI: Save $500K-2M+ annually in operational costs',
      '🏢 White-label platform for revenue generation',
      '👨‍💼 Dedicated success manager ensures maximum value',
      '🔧 Custom development for competitive advantage',
      '🌿 Carbon credit monetization creates new revenue'
    ],
    confidence: 0
  }
];

export default function PricingQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [scores, setScores] = useState({
    free: 0,
    hobbyist: 0,
    professional: 0,
    business: 0,
    enterprise: 0
  });

  const handleAnswer = (optionIndex: number) => {
    try {
      const question = questions[currentQuestion];
      const selectedOption = question.options[optionIndex];
      
      const newAnswer: QuizAnswer = {
        question: question.question,
        answer: selectedOption.text,
        score: selectedOption.scores
      };

      const newAnswers = [...answers, newAnswer];
      setAnswers(newAnswers);

      // Update scores
      const newScores = { ...scores };
      Object.keys(selectedOption.scores).forEach(tier => {
        const tierKey = tier as keyof typeof scores;
        const scoreKey = tier as keyof typeof selectedOption.scores;
        newScores[tierKey] += selectedOption.scores[scoreKey];
      });
      setScores(newScores);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setScores({
      free: 0,
      hobbyist: 0,
      professional: 0,
      business: 0,
      enterprise: 0
    });
  };

  const goBack = () => {
    try {
      if (currentQuestion > 0 && answers.length > 0) {
        const lastAnswer = answers[answers.length - 1];
        const newAnswers = answers.slice(0, -1);
        setAnswers(newAnswers);
        
        // Subtract last answer's scores
        const newScores = { ...scores };
        Object.keys(lastAnswer.score).forEach(tier => {
          const tierKey = tier as keyof typeof scores;
          const scoreKey = tier as keyof typeof lastAnswer.score;
          newScores[tierKey] -= lastAnswer.score[scoreKey];
        });
        setScores(newScores);
        
        setCurrentQuestion(currentQuestion - 1);
      }
    } catch (error) {
      console.error('Error going back:', error);
    }
  };

  const getRecommendedTier = () => {
    try {
      const maxScore = Math.max(...Object.values(scores));
      if (maxScore === 0) return tiers[0]; // Default to free if no scores
      return tiers.find(tier => scores[tier.id as keyof typeof scores] === maxScore) || tiers[0];
    } catch (error) {
      console.error('Error getting recommended tier:', error);
      return tiers[0];
    }
  };

  const getSortedTiers = () => {
    try {
      const maxScore = Math.max(...Object.values(scores));
      if (maxScore === 0) return tiers;
      
      return tiers
        .map(tier => ({
          ...tier,
          confidence: (scores[tier.id as keyof typeof scores] / maxScore) * 100
        }))
        .sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('Error sorting tiers:', error);
      return tiers;
    }
  };

  if (showResults) {
    const recommendedTier = getRecommendedTier();
    const sortedTiers = getSortedTiers();

    return (
      <div className="min-h-screen bg-gray-950 py-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 backdrop-blur-sm rounded-full border border-green-700/50 mb-6">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-200">Quiz Complete</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Your Recommended Plan
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Based on your answers, here's the plan that best fits your needs
            </p>
          </div>

          {/* Recommended Tier */}
          <div className="bg-gradient-to-br from-purple-900/20 to-gray-800 rounded-2xl p-8 border-2 border-purple-500 mb-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 backdrop-blur-sm rounded-full border border-green-700/50 mb-4">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-200">Perfect Match</span>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className={`w-16 h-16 bg-${recommendedTier?.color}-600 rounded-xl flex items-center justify-center`}>
                {recommendedTier?.icon && <recommendedTier.icon className="w-8 h-8 text-white" />}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{recommendedTier?.name}</h2>
                <p className="text-gray-300 mb-4">{recommendedTier?.description}</p>
                <div className="text-3xl font-bold text-purple-400 mb-6">{recommendedTier?.price}</div>
                
                <div className="space-y-3 mb-6">
                  {recommendedTier?.features.map((feature, index) => (
                    <div key={index} className="text-gray-300">
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-4 mb-6">
                  <p className="text-green-300 text-sm">
                    <strong>Why this works for you:</strong> Based on your answers, this plan offers the best balance of features and ROI for your specific situation.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Link 
                    href="/pricing" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Start Free Trial
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link 
                    href="/contact" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
                  >
                    Talk to Expert
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Other Options */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-6">Other Options to Consider</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {sortedTiers.slice(1, 3).map((tier) => (
                <div 
                  key={tier.id} 
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 bg-${tier.color}-600 rounded-lg flex items-center justify-center`}>
                      <tier.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{tier.name}</h4>
                      <p className="text-gray-400 text-sm">{tier.price}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">{tier.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {Math.round(tier.confidence)}% match
                    </span>
                    <Link 
                      href="/pricing" 
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Answers */}
          <div className="bg-gray-800/30 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Your Answers</h3>
            <div className="space-y-3">
              {answers.map((answer, index) => (
                <div key={index} className="flex justify-between items-start">
                  <span className="text-gray-300 text-sm">{answer.question}</span>
                  <span className="text-gray-400 text-sm font-medium ml-4">{answer.answer}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="text-center">
            <button
              onClick={resetQuiz}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Find Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-400">
            Answer a few questions to get a personalized recommendation
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
          {questions[currentQuestion] && (
            <>
              <h2 className="text-2xl font-semibold text-white mb-2">
                {questions[currentQuestion].question}
              </h2>
              <p className="text-gray-400 mb-8">
                {questions[currentQuestion].subtitle}
              </p>

              <div className="space-y-4">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className="w-full text-left p-6 rounded-xl border border-gray-600 hover:border-purple-500 hover:bg-purple-900/20 transition-all duration-200 group"
                  >
                    <div className="flex flex-col gap-2">
                      <span className="text-gray-300 group-hover:text-white font-medium">
                        {option.text}
                      </span>
                      <span className="text-sm text-purple-400 group-hover:text-purple-300">
                        {option.value}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={goBack}
            disabled={currentQuestion === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-gray-500 text-sm">
            Select an answer to continue
          </span>
        </div>
      </div>
    </div>
  );
}