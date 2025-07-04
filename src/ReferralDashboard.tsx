'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Gift, 
  TrendingUp, 
  Award,
  Share2,
  DollarSign,
  CheckCircle,
  Clock,
  UserPlus,
  Trophy,
  Target,
  ArrowRight,
  Copy,
  Send
} from 'lucide-react';
import { referralProgram, ReferralProgram, GraduationStatus } from '@/lib/referral-program';

interface ReferralDashboardProps {
  facilityId: string;
  userId: string;
}

export function ReferralDashboard({ facilityId, userId }: ReferralDashboardProps) {
  const [referrals, setReferrals] = useState<ReferralProgram[]>([]);
  const [graduationStatus, setGraduationStatus] = useState<GraduationStatus | null>(null);
  const [newReferralEmail, setNewReferralEmail] = useState('');
  const [newReferralName, setNewReferralName] = useState('');
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, [facilityId]);

  const loadReferralData = async () => {
    setLoading(true);
    try {
      // Load referrals
      const facilityReferrals = await referralProgram.getReferrals(facilityId);
      setReferrals(facilityReferrals);

      // Check graduation status
      const status = await referralProgram.checkGraduation(facilityId, {});
      setGraduationStatus(status);

      // Generate referral code
      const code = `VLX-${facilityId.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      setReferralCode(code);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReferral = async () => {
    if (!newReferralEmail || !newReferralName) return;

    setLoading(true);
    try {
      await referralProgram.createReferral(
        userId,
        facilityId,
        newReferralEmail,
        newReferralName
      );
      
      // Reload referrals
      await loadReferralData();
      
      // Clear form
      setNewReferralEmail('');
      setNewReferralName('');
      
      // Show success message
      alert('Referral invitation sent successfully!');
    } catch (error) {
      console.error('Error creating referral:', error);
      alert('Failed to send referral invitation');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/sign-up?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeReferrals = referrals.filter(r => r.status === 'active').length;
  const totalEarnings = referrals.reduce((sum, r) => {
    if (r.status === 'active' && r.benefits.referrer.cashBonus) {
      return sum + r.benefits.referrer.cashBonus;
    }
    return sum;
  }, 0);

  return (
    <div className="w-full space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Your Level</CardTitle>
            <Trophy className={`h-4 w-4 ${
              graduationStatus?.currentLevel === 'gold' ? 'text-yellow-400' :
              graduationStatus?.currentLevel === 'silver' ? 'text-gray-400' :
              graduationStatus?.currentLevel === 'bronze' ? 'text-orange-400' :
              'text-gray-600'
            }`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white capitalize">
              {graduationStatus?.currentLevel || 'Starter'}
            </div>
            <p className="text-xs text-gray-500">
              {graduationStatus?.benefits?.revenueShareReduction 
                ? `${(graduationStatus.benefits.revenueShareReduction * 100).toFixed(0)}% discount`
                : 'Complete milestones to level up'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Referrals</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeReferrals}</div>
            <p className="text-xs text-gray-500">
              {referrals.filter(r => r.status === 'pending').length} pending
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-gray-500">
              From referral bonuses
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Your Discount</CardTitle>
            <Gift className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {((graduationStatus?.benefits?.revenueShareReduction || 0) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-gray-500">
              Off revenue sharing
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="refer" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
          <TabsTrigger value="refer" className="data-[state=active]:bg-gray-700">
            Refer & Earn
          </TabsTrigger>
          <TabsTrigger value="status" className="data-[state=active]:bg-gray-700">
            Graduation Status
          </TabsTrigger>
          <TabsTrigger value="referrals" className="data-[state=active]:bg-gray-700">
            My Referrals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="refer" className="space-y-6 mt-6">
          {/* Referral Benefits */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Referral Program Benefits</CardTitle>
              <CardDescription className="text-gray-400">
                Earn rewards by helping other growers join VibeLux
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-purple-400">You Earn:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">$500 Cash Bonus</p>
                        <p className="text-xs text-gray-400">When your referral activates</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">2% Revenue Share Discount</p>
                        <p className="text-xs text-gray-400">For 12 months</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-purple-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">Milestone Bonuses</p>
                        <p className="text-xs text-gray-400">Up to $1,500 additional rewards</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-green-400">They Get:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Gift className="h-5 w-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">1 Month Free</p>
                        <p className="text-xs text-gray-400">No revenue sharing for first month</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">5% Revenue Share Discount</p>
                        <p className="text-xs text-gray-400">For 6 months</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-purple-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">Priority Support</p>
                        <p className="text-xs text-gray-400">Direct access to success team</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Share Link */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Share Your Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/sign-up?ref=${referralCode}`}
                    readOnly
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <Button 
                    onClick={copyReferralLink}
                    variant="outline"
                    className="bg-gray-800 hover:bg-gray-700 border-gray-700"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  Share this link with growers who could benefit from VibeLux
                </p>
              </CardContent>
            </Card>

            {/* Email Invite */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send Email Invite
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Facility Name</Label>
                  <Input
                    placeholder="Green Valley Farms"
                    value={newReferralName}
                    onChange={(e) => setNewReferralName(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="grower@example.com"
                    value={newReferralEmail}
                    onChange={(e) => setNewReferralEmail(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Button 
                  onClick={handleCreateReferral}
                  disabled={loading || !newReferralEmail || !newReferralName}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Send Invitation
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-6 mt-6">
          {/* Current Level */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Your Graduation Status</CardTitle>
              <CardDescription className="text-gray-400">
                Unlock better terms as you grow with VibeLux
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Level Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Level</span>
                    <span className="text-white font-semibold capitalize">
                      {graduationStatus?.currentLevel || 'Starter'}
                    </span>
                  </div>
                  {graduationStatus?.nextLevel && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Progress to {graduationStatus.nextLevel.level}</span>
                        <span className="text-white">
                          {Math.round((graduationStatus.improvements.monthsActive / graduationStatus.nextLevel.requirements.monthsActive) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(graduationStatus.improvements.monthsActive / graduationStatus.nextLevel.requirements.monthsActive) * 100}
                        className="h-2"
                      />
                    </div>
                  )}
                </div>

                {/* Current Benefits */}
                {graduationStatus?.benefits && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-purple-400">Your Current Benefits</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Revenue Share Discount</p>
                        <p className="text-lg font-semibold text-white">
                          {(graduationStatus.benefits.revenueShareReduction * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Support Level</p>
                        <p className="text-lg font-semibold text-white">
                          {graduationStatus.benefits.prioritySupport ? 'Priority' : 'Standard'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Level Requirements */}
                {graduationStatus?.nextLevel && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-green-400">
                      Requirements for {graduationStatus.nextLevel.level} Level
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Months Active</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white">
                            {graduationStatus.improvements.monthsActive} / {graduationStatus.nextLevel.requirements.monthsActive}
                          </span>
                          {graduationStatus.improvements.monthsActive >= graduationStatus.nextLevel.requirements.monthsActive && (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Avg Yield Improvement</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white">
                            {graduationStatus.improvements.avgYieldImprovement}% / {graduationStatus.nextLevel.requirements.avgYieldImprovement}%
                          </span>
                          {graduationStatus.improvements.avgYieldImprovement >= graduationStatus.nextLevel.requirements.avgYieldImprovement && (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Avg Energy Reduction</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white">
                            {graduationStatus.improvements.avgEnergyReduction}% / {graduationStatus.nextLevel.requirements.avgEnergyReduction}%
                          </span>
                          {graduationStatus.improvements.avgEnergyReduction >= graduationStatus.nextLevel.requirements.avgEnergyReduction && (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Level Benefits */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Graduation Levels & Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Bronze', 'Silver', 'Gold'].map((level, index) => (
                  <div 
                    key={level}
                    className={`p-4 rounded-lg border ${
                      graduationStatus?.currentLevel === level.toLowerCase()
                        ? 'bg-purple-900/20 border-purple-700'
                        : 'bg-gray-800 border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Trophy className={`h-5 w-5 ${
                          level === 'Gold' ? 'text-yellow-400' :
                          level === 'Silver' ? 'text-gray-400' :
                          'text-orange-400'
                        }`} />
                        <h4 className="font-semibold text-white">{level} Level</h4>
                      </div>
                      <Badge variant={graduationStatus?.currentLevel === level.toLowerCase() ? 'default' : 'secondary'}>
                        {[6, 12, 24][index]}+ months
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Revenue Share Discount</p>
                        <p className="text-white font-medium">{[1, 2, 3][index]}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Special Features</p>
                        <p className="text-white font-medium">
                          {index === 0 ? 'ML Predictions' : 
                           index === 1 ? 'API Access' : 
                           'All Features'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6 mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Your Referrals</CardTitle>
              <CardDescription className="text-gray-400">
                Track the status of your referrals and earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No referrals yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Start referring to earn rewards!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {referrals.map((referral) => (
                    <div 
                      key={referral.id}
                      className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">
                            {referral.referredFacilityId || 'Pending Registration'}
                          </p>
                          <p className="text-sm text-gray-400">
                            Referred on {new Date(referral.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            referral.status === 'active' ? 'default' :
                            referral.status === 'completed' ? 'secondary' :
                            'outline'
                          }>
                            {referral.status}
                          </Badge>
                          {referral.status === 'active' && referral.benefits.referrer.cashBonus && (
                            <span className="text-green-400 font-semibold">
                              +${referral.benefits.referrer.cashBonus}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Milestones */}
                      {referral.status === 'active' && (
                        <div className="mt-4 space-y-2">
                          {referral.milestones.map((milestone) => (
                            <div 
                              key={milestone.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                {milestone.achieved ? (
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                ) : (
                                  <Clock className="h-4 w-4 text-gray-500" />
                                )}
                                <span className={milestone.achieved ? 'text-white' : 'text-gray-400'}>
                                  {milestone.name}
                                </span>
                              </div>
                              <span className={milestone.achieved ? 'text-green-400' : 'text-gray-500'}>
                                {milestone.reward.type === 'cash' ? `$${milestone.reward.amount}` :
                                 milestone.reward.type === 'revenue_share_reduction' ? `${milestone.reward.amount * 100}% off` :
                                 `$${milestone.reward.amount} credit`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}