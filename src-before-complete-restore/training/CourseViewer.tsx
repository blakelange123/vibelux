'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Maximize, 
  Settings,
  FileText,
  MessageSquare,
  Bookmark,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  BookOpen,
  PenTool,
  Share2,
  Subtitles
} from 'lucide-react';
import {
  Course,
  Module,
  ModuleContent,
  ContentType,
  VideoContent,
  Assessment,
  CourseProgress,
  ContentProgress,
  VideoQuality
} from '@/lib/training/training-types';
import {
  VideoPlayer,
  PlaybackSession,
  InteractionType,
  VideoNote,
  VideoBookmark
} from '@/lib/training/video-library';

interface CourseViewerProps {
  courseId: string;
  userId: string;
  onComplete?: () => void;
}

export default function CourseViewer({ courseId, userId, onComplete }: CourseViewerProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [currentContent, setCurrentContent] = useState<ModuleContent | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showCaptions, setShowCaptions] = useState(false);
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [bookmarks, setBookmarks] = useState<VideoBookmark[]>([]);
  const [newNote, setNewNote] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [quality, setQuality] = useState<VideoQuality>(VideoQuality.HD);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCourse();
    loadProgress();
  }, [courseId, userId]);

  const loadCourse = async () => {
    // In a real app, this would fetch from API
    // For now, using mock data
    setCourse(mockCourse);
    if (mockCourse.modules.length > 0) {
      setCurrentModule(mockCourse.modules[0]);
      if (mockCourse.modules[0].content.length > 0) {
        setCurrentContent(mockCourse.modules[0].content[0]);
      }
    }
  };

  const loadProgress = async () => {
    // Load user's progress for this course
    setCourseProgress(mockCourseProgress);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      trackInteraction(isPlaying ? InteractionType.PAUSE : InteractionType.PLAY);
    }
  };

  const handleSeek = (newTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      trackInteraction(InteractionType.SEEK, { seekTo: newTime });
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      trackInteraction(InteractionType.SPEED_CHANGE, { speed: rate });
    }
  };

  const handleQualityChange = (newQuality: VideoQuality) => {
    setQuality(newQuality);
    trackInteraction(InteractionType.QUALITY_CHANGE, { quality: newQuality });
    // In a real app, this would switch video source
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    trackInteraction(InteractionType.FULLSCREEN_TOGGLE);
  };

  const toggleCaptions = () => {
    setShowCaptions(!showCaptions);
    trackInteraction(InteractionType.CAPTION_TOGGLE);
  };

  const addNote = () => {
    if (newNote.trim() && currentContent) {
      const note: VideoNote = {
        id: Date.now().toString(),
        userId,
        videoId: currentContent.id,
        timestamp: currentTime,
        note: newNote,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPrivate: true
      };
      setNotes([...notes, note]);
      setNewNote('');
      trackInteraction(InteractionType.NOTE_ADDED, { timestamp: currentTime });
    }
  };

  const addBookmark = () => {
    if (currentContent) {
      const bookmark: VideoBookmark = {
        id: Date.now().toString(),
        userId,
        videoId: currentContent.id,
        timestamp: currentTime,
        title: `Bookmark at ${formatTime(currentTime)}`,
        createdAt: new Date()
      };
      setBookmarks([...bookmarks, bookmark]);
      trackInteraction(InteractionType.BOOKMARK_ADDED, { timestamp: currentTime });
    }
  };

  const trackInteraction = (type: InteractionType, data?: any) => {
    // Track user interactions for analytics
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const navigateContent = (direction: 'prev' | 'next') => {
    if (!course || !currentModule || !currentContent) return;

    const currentModuleIndex = course.modules.findIndex(m => m.id === currentModule.id);
    const currentContentIndex = currentModule.content.findIndex(c => c.id === currentContent.id);

    if (direction === 'next') {
      if (currentContentIndex < currentModule.content.length - 1) {
        setCurrentContent(currentModule.content[currentContentIndex + 1]);
      } else if (currentModuleIndex < course.modules.length - 1) {
        const nextModule = course.modules[currentModuleIndex + 1];
        setCurrentModule(nextModule);
        setCurrentContent(nextModule.content[0]);
      }
    } else {
      if (currentContentIndex > 0) {
        setCurrentContent(currentModule.content[currentContentIndex - 1]);
      } else if (currentModuleIndex > 0) {
        const prevModule = course.modules[currentModuleIndex - 1];
        setCurrentModule(prevModule);
        setCurrentContent(prevModule.content[prevModule.content.length - 1]);
      }
    }
  };

  const getModuleProgress = (moduleId: string): number => {
    const moduleProgress = courseProgress?.moduleProgress.find(mp => mp.moduleId === moduleId);
    return moduleProgress?.progress || 0;
  };

  const getContentProgress = (contentId: string): ContentProgress | undefined => {
    return courseProgress?.moduleProgress
      .flatMap(mp => mp.contentProgress)
      .find(cp => cp.contentId === contentId);
  };

  if (!course) {
    return <div>Loading course...</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{course.title}</h1>
            <p className="text-gray-400">{currentModule?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {Math.round(course.duration / 60)}h total
          </Badge>
          <Button variant="outline" size="sm" className="gap-1">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Video Player */}
          {currentContent?.type === ContentType.VIDEO && (
            <Card className="bg-gray-900 border-gray-800 overflow-hidden" ref={playerContainerRef}>
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  src={(currentContent as VideoContent).videoUrl}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                />
                
                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <Progress 
                      value={(currentTime / duration) * 100} 
                      className="h-1 cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const percentage = x / rect.width;
                        handleSeek(percentage * duration);
                      }}
                    />
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSeek(currentTime - 10)}
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handlePlayPause}
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSeek(currentTime + 10)}
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-white">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleCaptions}
                        className={showCaptions ? 'text-purple-500' : ''}
                      >
                        <Subtitles className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePlaybackRateChange(playbackRate === 1 ? 1.5 : 1)}
                      >
                        {playbackRate}x
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleFullscreen}
                      >
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-gray-900 border-gray-800">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
              {currentModule?.assessment && <TabsTrigger value="quiz">Quiz</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card className="bg-gray-900 border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-3">{currentContent?.title}</h3>
                <p className="text-gray-300">{currentContent?.description}</p>
                
                {/* Video Actions */}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={addBookmark}>
                    <Bookmark className="h-4 w-4 mr-1" />
                    Add Bookmark
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowTranscript(!showTranscript)}>
                    <FileText className="h-4 w-4 mr-1" />
                    Transcript
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </Card>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => navigateContent('prev')}
                  disabled={!currentModule || currentModule.content[0].id === currentContent?.id}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button 
                  onClick={() => navigateContent('next')}
                  disabled={!currentModule || currentModule.content[currentModule.content.length - 1].id === currentContent?.id}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card className="bg-gray-900 border-gray-800 p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Add Note</h3>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a note at current timestamp..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                      />
                      <Button onClick={addNote}>
                        <PenTool className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-500"
                            onClick={() => handleSeek(note.timestamp)}
                          >
                            {formatTime(note.timestamp)}
                          </Button>
                          <span className="text-xs text-gray-400">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300">{note.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <Card className="bg-gray-900 border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Course Resources</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="text-white">Course Slides.pdf</span>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="text-white">Supplementary Reading.pdf</span>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="discussion" className="space-y-4">
              <Card className="bg-gray-900 border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Discussion</h3>
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No discussions yet. Be the first to ask a question!</p>
                  <Button className="mt-4">Start Discussion</Button>
                </div>
              </Card>
            </TabsContent>

            {currentModule?.assessment && (
              <TabsContent value="quiz" className="space-y-4">
                <Card className="bg-gray-900 border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Module Quiz</h3>
                  <p className="text-gray-300 mb-6">
                    Test your knowledge with this module quiz. You need {currentModule.assessment.passingScore}% to pass.
                  </p>
                  <Button className="w-full">
                    Start Quiz ({currentModule.assessment.questions.length} questions)
                  </Button>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Sidebar - Course Navigation */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-900 border-gray-800 p-4 sticky top-4">
            <h3 className="text-lg font-semibold text-white mb-4">Course Content</h3>
            <div className="space-y-3">
              {course.modules.map((module, moduleIndex) => (
                <div key={module.id} className="space-y-2">
                  <div className="flex items-center justify-between p-2">
                    <h4 className="font-medium text-white text-sm">
                      {moduleIndex + 1}. {module.title}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {getModuleProgress(module.id)}%
                    </span>
                  </div>
                  <div className="space-y-1 ml-4">
                    {module.content.map((content, contentIndex) => {
                      const progress = getContentProgress(content.id);
                      const isActive = currentContent?.id === content.id;
                      
                      return (
                        <button
                          key={content.id}
                          onClick={() => {
                            setCurrentModule(module);
                            setCurrentContent(content);
                          }}
                          className={`w-full text-left p-2 rounded-lg transition-colors ${
                            isActive ? 'bg-purple-600/20 text-purple-400' : 'hover:bg-gray-800 text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {progress?.completed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-gray-600" />
                            )}
                            <span className="text-sm flex-1">{content.title}</span>
                            {content.duration && (
                              <span className="text-xs text-gray-500">
                                {content.duration}m
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Course Progress */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Course Progress</span>
                <span className="text-sm font-medium text-white">
                  {courseProgress?.progress || 0}%
                </span>
              </div>
              <Progress value={courseProgress?.progress || 0} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Mock data for demonstration
const mockCourse: Course = {
  id: 'course1',
  programId: 'prog1',
  title: 'Cannabis Cultivation Fundamentals',
  description: 'Learn the basics of cannabis cultivation',
  modules: [
    {
      id: 'mod1',
      courseId: 'course1',
      title: 'Introduction to Cannabis Biology',
      description: 'Understanding cannabis plant biology and growth cycles',
      content: [
        {
          id: 'content1',
          type: ContentType.VIDEO,
          title: 'Cannabis Plant Anatomy',
          description: 'Learn about the different parts of the cannabis plant',
          url: 'https://example.com/video1.mp4',
          duration: 15,
          order: 1,
          videoUrl: 'https://example.com/video1.mp4'
        } as VideoContent,
        {
          id: 'content2',
          type: ContentType.DOCUMENT,
          title: 'Growth Stages Reference Guide',
          description: 'Detailed guide on cannabis growth stages',
          url: 'https://example.com/guide.pdf',
          duration: 10,
          order: 2
        }
      ],
      assessment: {
        id: 'assess1',
        type: 'quiz' as any,
        title: 'Module 1 Quiz',
        description: 'Test your knowledge',
        questions: [
          {
            id: 'q1',
            type: 'multiple_choice' as any,
            question: 'What are the main growth stages of cannabis?',
            options: ['Seedling, Vegetative, Flowering', 'Growth, Bloom, Harvest'],
            correctAnswer: 'Seedling, Vegetative, Flowering',
            points: 10
          }
        ],
        passingScore: 80
      },
      duration: 25,
      order: 1,
      requiredForCompletion: true
    }
  ],
  duration: 180,
  passingScore: 80,
  maxAttempts: 3,
  order: 1
};

const mockCourseProgress: CourseProgress = {
  courseId: 'course1',
  moduleProgress: [
    {
      moduleId: 'mod1',
      contentProgress: [
        {
          contentId: 'content1',
          progress: 50,
          completed: false,
          timeSpent: 7.5,
          lastPosition: 450
        }
      ],
      progress: 25,
      status: 'in_progress' as any,
      timeSpent: 7.5,
      startedAt: new Date()
    }
  ],
  assessmentResults: [],
  progress: 25,
  status: 'in_progress' as any,
  startedAt: new Date()
};