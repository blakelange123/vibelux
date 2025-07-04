'use client';

import React, { useState, useEffect } from 'react';
import {
  PlayCircle, PauseCircle, SkipForward, SkipBack,
  Volume2, VolumeX, Maximize, CheckCircle, XCircle,
  AlertCircle, Info, Camera, Target, ArrowRight,
  RotateCw, ChevronLeft, ChevronRight, Award
} from 'lucide-react';

interface InteractiveLessonPlayerProps {
  lessonId: string;
  lessonType: 'video' | 'interactive' | 'quiz' | 'practical';
  content: any;
  onComplete: (score: number) => void;
  onProgress: (progress: number) => void;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'image-select';
  options: string[];
  correctAnswer: string | string[];
  explanation: string;
  image?: string;
}

interface InteractiveStep {
  id: string;
  title: string;
  description: string;
  task: string;
  validation: string[];
  hints: string[];
  image?: string;
}

interface PracticalExercise {
  id: string;
  title: string;
  scenario: string;
  objectives: string[];
  photoRequirements: string[];
  evaluationCriteria: string[];
}

export default function InteractiveLessonPlayer({
  lessonId,
  lessonType,
  content,
  onComplete,
  onProgress
}: InteractiveLessonPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(300); // 5 minutes default
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  
  // Interactive state
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  
  // Practical state
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [photoAnnotations, setPhotoAnnotations] = useState<Record<string, string>>({});

  // Mock data for different lesson types
  const mockQuizQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      question: 'What is the ideal angle for photographing pest damage on leaves?',
      type: 'multiple-choice',
      options: [
        'From directly above',
        'From below showing the underside',
        'Both top and bottom angles',
        'From the side only'
      ],
      correctAnswer: 'Both top and bottom angles',
      explanation: 'Photographing both top and bottom of leaves helps AI detect pests that may hide on the underside and shows the full extent of damage.'
    },
    {
      id: 'q2',
      question: 'Spider mites typically appear on the underside of leaves first.',
      type: 'true-false',
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: 'Spider mites prefer the protected environment on the underside of leaves where humidity is higher.'
    },
    {
      id: 'q3',
      question: 'Which photo shows proper lighting for pest detection?',
      type: 'image-select',
      options: ['Image A', 'Image B', 'Image C', 'Image D'],
      correctAnswer: 'Image B',
      explanation: 'Image B shows even, diffused lighting that reveals details without harsh shadows or glare.'
    }
  ];

  const mockInteractiveSteps: InteractiveStep[] = [
    {
      id: 'step1',
      title: 'Access Camera Mode',
      description: 'Learn how to quickly access the Visual Operations camera',
      task: 'Tap the purple camera button to open Visual Operations',
      validation: ['Camera button tapped', 'Visual Ops menu opened'],
      hints: ['Look for the floating purple button', 'It\'s usually in the bottom-right corner']
    },
    {
      id: 'step2',
      title: 'Select Report Type',
      description: 'Choose the appropriate issue category',
      task: 'Select "Pest/Disease" from the quick actions menu',
      validation: ['Report type selected', 'Location entered'],
      hints: ['Each report type has specific AI analysis', 'Always enter location first']
    },
    {
      id: 'step3',
      title: 'Capture Multiple Angles',
      description: 'Take photos from different perspectives',
      task: 'Capture at least 3 photos: wide shot, close-up, and detail',
      validation: ['3+ photos captured', 'Different angles used'],
      hints: ['Use the multi-photo feature', 'Include context in wide shots']
    }
  ];

  const mockPracticalExercise: PracticalExercise = {
    id: 'prac1',
    title: 'Document a Pest Issue',
    scenario: 'You\'ve noticed some plants in Veg Room 2 showing signs of pest damage. Document this issue properly for immediate action.',
    objectives: [
      'Identify the affected area',
      'Capture comprehensive photos',
      'Add relevant annotations',
      'Submit with appropriate severity'
    ],
    photoRequirements: [
      'Wide shot showing affected plants in context',
      'Close-up of damaged leaves (top view)',
      'Underside of affected leaves',
      'Any visible pests or eggs',
      'Comparison with healthy plant'
    ],
    evaluationCriteria: [
      'Photo clarity and focus',
      'Appropriate angles captured',
      'Useful annotations added',
      'Correct severity assessment'
    ]
  };

  useEffect(() => {
    // Update progress
    if (lessonType === 'video') {
      const progress = (currentTime / duration) * 100;
      onProgress(progress);
    } else if (lessonType === 'quiz') {
      const progress = (currentQuestion / mockQuizQuestions.length) * 100;
      onProgress(progress);
    } else if (lessonType === 'interactive') {
      const progress = (completedSteps.length / mockInteractiveSteps.length) * 100;
      onProgress(progress);
    }
  }, [currentTime, currentQuestion, completedSteps, lessonType]);

  const handleVideoComplete = () => {
    onComplete(100);
  };

  const handleQuizSubmit = () => {
    let correctAnswers = 0;
    mockQuizQuestions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / mockQuizQuestions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
    onComplete(finalScore);
  };

  const handleInteractiveComplete = () => {
    const finalScore = completedSteps.length === mockInteractiveSteps.length ? 100 : 80;
    onComplete(finalScore);
  };

  const handlePracticalSubmit = () => {
    // Evaluate based on photo count and annotations
    const photoScore = Math.min(capturedPhotos.length * 20, 60);
    const annotationScore = Object.keys(photoAnnotations).length * 10;
    const finalScore = Math.min(photoScore + annotationScore, 100);
    onComplete(finalScore);
  };

  const renderVideoPlayer = () => (
    <div className="bg-black rounded-lg overflow-hidden">
      <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <PlayCircle className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Video content would play here</p>
        </div>
        
        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="mb-2">
            <div className="bg-gray-600 rounded-full h-1 cursor-pointer">
              <div 
                className="bg-purple-500 h-1 rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isPlaying ? (
                  <PauseCircle className="w-6 h-6 text-white" />
                ) : (
                  <PlayCircle className="w-6 h-6 text-white" />
                )}
              </button>
              
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <SkipBack className="w-5 h-5 text-white" />
              </button>
              
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <SkipForward className="w-5 h-5 text-white" />
              </button>
              
              <span className="text-sm text-white ml-2">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / 
                {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
              
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Maximize className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video Chapters */}
      <div className="p-4 bg-gray-800">
        <h4 className="font-medium text-white mb-3">Chapters</h4>
        <div className="space-y-2">
          <button className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-white">1. Introduction</span>
              <span className="text-sm text-gray-400">0:00</span>
            </div>
          </button>
          <button className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-white">2. Common Pest Types</span>
              <span className="text-sm text-gray-400">2:15</span>
            </div>
          </button>
          <button className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-white">3. Photo Techniques</span>
              <span className="text-sm text-gray-400">4:30</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderQuiz = () => {
    if (showResults) {
      return (
        <div className="text-center py-12">
          <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center ${
            score >= 80 ? 'bg-green-600/20' : 'bg-yellow-600/20'
          }`}>
            {score >= 80 ? (
              <Award className="w-16 h-16 text-green-500" />
            ) : (
              <RotateCw className="w-16 h-16 text-yellow-500" />
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">
            {score >= 80 ? 'Congratulations!' : 'Good Effort!'}
          </h3>
          <p className="text-gray-400 mb-6">
            You scored {score}%
          </p>
          
          <div className="max-w-lg mx-auto">
            {mockQuizQuestions.map((question, index) => {
              const isCorrect = answers[question.id] === question.correctAnswer;
              return (
                <div key={question.id} className="mb-4 text-left bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-medium text-white">Question {index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{question.question}</p>
                  <p className="text-sm text-gray-300">
                    Your answer: {answers[question.id] || 'Not answered'}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-green-400 mt-1">
                      Correct: {question.correctAnswer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          
          {score < 80 && (
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentQuestion(0);
                setAnswers({});
                setScore(0);
              }}
              className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Retake Quiz
            </button>
          )}
        </div>
      );
    }
    
    const question = mockQuizQuestions[currentQuestion];
    
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Question {currentQuestion + 1} of {mockQuizQuestions.length}
            </span>
            <span className="text-sm text-gray-400">
              {Object.keys(answers).length} answered
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / mockQuizQuestions.length) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{question.question}</h3>
          
          {question.type === 'image-select' && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {question.options.map(option => (
                <div key={option} className="bg-gray-700 rounded-lg aspect-video flex items-center justify-center">
                  <span className="text-gray-500">{option}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="space-y-2">
            {question.options.map(option => (
              <button
                key={option}
                onClick={() => setAnswers({ ...answers, [question.id]: option })}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  answers[question.id] === option
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    answers[question.id] === option
                      ? 'border-white bg-white'
                      : 'border-gray-500'
                  }`}>
                    {answers[question.id] === option && (
                      <div className="w-full h-full rounded-full bg-purple-600 scale-50" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          {currentQuestion < mockQuizQuestions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleQuizSubmit}
              disabled={Object.keys(answers).length < mockQuizQuestions.length}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Submit Quiz
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderInteractive = () => {
    const step = mockInteractiveSteps[currentStep];
    
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {mockInteractiveSteps.length}
            </span>
            <span className="text-sm text-gray-400">
              {completedSteps.length} completed
            </span>
          </div>
          <div className="flex items-center gap-2">
            {mockInteractiveSteps.map((s, index) => (
              <div
                key={s.id}
                className={`flex-1 h-2 rounded-full transition-all ${
                  completedSteps.includes(s.id)
                    ? 'bg-green-500'
                    : index === currentStep
                    ? 'bg-purple-500'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {/* Interactive Demo Area */}
          <div className="bg-gray-900 p-8 flex items-center justify-center aspect-video">
            <div className="text-center">
              <Target className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <p className="text-gray-400">Interactive demonstration area</p>
              <p className="text-sm text-gray-500 mt-2">
                In production, this would show the actual app interface
              </p>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
            <p className="text-gray-400 mb-4">{step.description}</p>
            
            <div className="bg-purple-900/20 border border-purple-800/50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-purple-300 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Your Task
              </h4>
              <p className="text-purple-200">{step.task}</p>
            </div>
            
            {showHint && (
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-300 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Hints
                </h4>
                <ul className="space-y-1">
                  {step.hints.map((hint, index) => (
                    <li key={index} className="text-blue-200 text-sm">• {hint}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                {showHint ? 'Hide hints' : 'Need help?'}
              </button>
              
              <button
                onClick={() => {
                  setCompletedSteps([...completedSteps, step.id]);
                  if (currentStep < mockInteractiveSteps.length - 1) {
                    setCurrentStep(currentStep + 1);
                    setShowHint(false);
                  } else {
                    handleInteractiveComplete();
                  }
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPractical = () => {
    const exercise = mockPracticalExercise;
    
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">{exercise.title}</h3>
          <p className="text-gray-400 mb-4">{exercise.scenario}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                Objectives
              </h4>
              <ul className="space-y-2">
                {exercise.objectives.map((obj, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-400" />
                Photo Requirements
              </h4>
              <ul className="space-y-2">
                {exercise.photoRequirements.map((req, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <CheckCircle className={`w-4 h-4 mt-0.5 ${
                      capturedPhotos.length > index ? 'text-green-500' : 'text-gray-600'
                    }`} />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Photo Upload Area */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h4 className="font-medium text-white mb-4">Upload Your Photos</h4>
            
            {capturedPhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {capturedPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                      <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <button className="absolute top-2 right-2 p-1 bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">Upload photos to complete the exercise</p>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                  Upload Photos
                </button>
              </div>
            )}
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Add notes about your photos (optional)
              </label>
              <textarea
                placeholder="Describe what you captured and why..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                rows={3}
              />
            </div>
          </div>
          
          <button
            onClick={handlePracticalSubmit}
            disabled={capturedPhotos.length === 0}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
          >
            Submit Exercise
          </button>
        </div>
        
        {/* Evaluation Criteria */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Evaluation Criteria
          </h4>
          <p className="text-sm text-gray-400 mb-3">Your submission will be evaluated on:</p>
          <ul className="space-y-2">
            {exercise.evaluationCriteria.map((criteria, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-green-400">•</span>
                {criteria}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {lessonType === 'video' && renderVideoPlayer()}
      {lessonType === 'quiz' && renderQuiz()}
      {lessonType === 'interactive' && renderInteractive()}
      {lessonType === 'practical' && renderPractical()}
    </div>
  );
}