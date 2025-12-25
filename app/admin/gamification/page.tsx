'use client';

import React, { useState } from 'react';
import { useGamification } from '@/app/context/GamificationContext';
import { BonusRule } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function GamificationPage() {
  const { config, updateConfig, addBonusRule, removeBonusRule, updateBonusRule } = useGamification();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'settings' | 'bonus-rules' | 'levels'>('settings');

  // Settings form state
  const [pointsPerRupee, setPointsPerRupee] = useState(config.pointsPerRupee);
  const [firstTimeBonusPoints, setFirstTimeBonusPoints] = useState(config.firstTimeBonusPoints);
  const [firstTimeThreshold, setFirstTimeThreshold] = useState(config.firstTimeThreshold);
  const [redeemRate, setRedeemRate] = useState(config.redeemRate);
  const [maxRedeemPercent, setMaxRedeemPercent] = useState(config.maxRedeemPercent);
  const [referralBonus, setReferralBonus] = useState(config.referralBonus);
  const [birthdayBonus, setBirthdayBonus] = useState(config.birthdayBonus);

  // Bonus rule form state
  const [newRule, setNewRule] = useState<Partial<BonusRule>>({
    name: '',
    type: 'percentage',
    active: true,
    description: '',
  });

  const handleSaveSettings = () => {
    const updatedConfig = {
      ...config,
      pointsPerRupee,
      firstTimeBonusPoints,
      firstTimeThreshold,
      redeemRate,
      maxRedeemPercent,
      referralBonus,
      birthdayBonus,
    };
    updateConfig(updatedConfig);
    addToast({
      title: 'Settings Updated',
      description: 'Gamification settings saved successfully!',
    });
  };

  const handleAddBonusRule = () => {
    if (!newRule.name || !newRule.description) {
      addToast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
      });
      return;
    }

    const rule: BonusRule = {
      id: Date.now().toString(),
      name: newRule.name || '',
      type: (newRule.type as any) || 'percentage',
      active: newRule.active !== false,
      description: newRule.description || '',
      bonusPoints: newRule.bonusPoints || 0,
      minPurchaseAmount: newRule.minPurchaseAmount || 0,
      purchaseCount: newRule.purchaseCount || 5,
      applicableCategories: newRule.applicableCategories || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addBonusRule(rule);
    setNewRule({
      name: '',
      type: 'percentage',
      active: true,
      description: '',
    });
    addToast({
      title: 'Bonus Rule Added',
      description: 'New bonus rule created successfully!',
    });
  };

  const handleToggleRule = (ruleId: string) => {
    const rule = config.bonusRules.find((r) => r.id === ruleId);
    if (rule) {
      updateBonusRule(ruleId, { ...rule, active: !rule.active });
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    removeBonusRule(ruleId);
    addToast({
      title: 'Bonus Rule Deleted',
      description: 'The rule has been removed',
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Gamification Settings</h1>
          <p className="text-muted-foreground">Manage points, rewards, and loyalty bonuses</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-header font-semibold transition-colors ${
              activeTab === 'settings'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Core Settings
          </button>
          <button
            onClick={() => setActiveTab('bonus-rules')}
            className={`px-6 py-3 font-header font-semibold transition-colors ${
              activeTab === 'bonus-rules'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Bonus Rules
          </button>
          <button
            onClick={() => setActiveTab('levels')}
            className={`px-6 py-3 font-header font-semibold transition-colors ${
              activeTab === 'levels'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Level Tiers
          </button>
        </div>

        {/* Core Settings Tab */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Points Per Rupee */}
            <div className="glass-card p-6 rounded-lg">
              <label className="block text-sm font-header font-semibold mb-2">Points Per Rupee</label>
              <p className="text-xs text-muted-foreground mb-3">
                How many points customers earn for every rupee spent
              </p>
              <input
                type="number"
                step="0.1"
                value={pointsPerRupee}
                onChange={(e) => setPointsPerRupee(parseFloat(e.target.value))}
                className="w-full bg-input-background border border-border rounded px-3 py-2 text-foreground"
              />
              <p className="text-xs text-primary mt-2">Example: 1 rupee = {pointsPerRupee} points</p>
            </div>

            {/* First Time Bonus */}
            <div className="glass-card p-6 rounded-lg">
              <label className="block text-sm font-header font-semibold mb-2">First Purchase Bonus Points</label>
              <p className="text-xs text-muted-foreground mb-3">Bonus points for first-time customers</p>
              <input
                type="number"
                value={firstTimeBonusPoints}
                onChange={(e) => setFirstTimeBonusPoints(parseInt(e.target.value))}
                className="w-full bg-input-background border border-border rounded px-3 py-2 text-foreground"
              />
              <p className="text-xs text-primary mt-2">{firstTimeBonusPoints} bonus points</p>
            </div>

            {/* First Time Threshold */}
            <div className="glass-card p-6 rounded-lg">
              <label className="block text-sm font-header font-semibold mb-2">First Purchase Minimum Amount</label>
              <p className="text-xs text-muted-foreground mb-3">Minimum order amount to qualify for first-time bonus</p>
              <input
                type="number"
                value={firstTimeThreshold}
                onChange={(e) => setFirstTimeThreshold(parseInt(e.target.value))}
                className="w-full bg-input-background border border-border rounded px-3 py-2 text-foreground"
              />
              <p className="text-xs text-primary mt-2">Minimum: ₹{firstTimeThreshold}</p>
            </div>

            {/* Redeem Rate */}
            <div className="glass-card p-6 rounded-lg">
              <label className="block text-sm font-header font-semibold mb-2">Redeem Rate (Point to Rupee)</label>
              <p className="text-xs text-muted-foreground mb-3">How much 1 point is worth in rupees</p>
              <input
                type="number"
                step="0.1"
                value={redeemRate}
                onChange={(e) => setRedeemRate(parseFloat(e.target.value))}
                className="w-full bg-input-background border border-border rounded px-3 py-2 text-foreground"
              />
              <p className="text-xs text-primary mt-2">1 point = ₹{redeemRate}</p>
            </div>

            {/* Max Redeem Percent */}
            <div className="glass-card p-6 rounded-lg">
              <label className="block text-sm font-header font-semibold mb-2">Max Redeem Percentage</label>
              <p className="text-xs text-muted-foreground mb-3">Max % of order that can be paid with points</p>
              <input
                type="number"
                min="0"
                max="100"
                value={maxRedeemPercent}
                onChange={(e) => setMaxRedeemPercent(parseInt(e.target.value))}
                className="w-full bg-input-background border border-border rounded px-3 py-2 text-foreground"
              />
              <p className="text-xs text-primary mt-2">Max {maxRedeemPercent}% of order value</p>
            </div>

            {/* Referral Bonus */}
            <div className="glass-card p-6 rounded-lg">
              <label className="block text-sm font-header font-semibold mb-2">Referral Bonus Points</label>
              <p className="text-xs text-muted-foreground mb-3">Points awarded for successful referral</p>
              <input
                type="number"
                value={referralBonus}
                onChange={(e) => setReferralBonus(parseInt(e.target.value))}
                className="w-full bg-input-background border border-border rounded px-3 py-2 text-foreground"
              />
              <p className="text-xs text-primary mt-2">{referralBonus} points per referral</p>
            </div>

            {/* Birthday Bonus */}
            <div className="glass-card p-6 rounded-lg">
              <label className="block text-sm font-header font-semibold mb-2">Birthday Bonus Points</label>
              <p className="text-xs text-muted-foreground mb-3">Bonus points on customer's birthday</p>
              <input
                type="number"
                value={birthdayBonus}
                onChange={(e) => setBirthdayBonus(parseInt(e.target.value))}
                className="w-full bg-input-background border border-border rounded px-3 py-2 text-foreground"
              />
              <p className="text-xs text-primary mt-2">{birthdayBonus} bonus points</p>
            </div>
          </div>
        )}

        {/* Save Button for Settings */}
        {activeTab === 'settings' && (
          <button
            onClick={handleSaveSettings}
            className="mt-8 px-8 py-3 bg-primary text-primary-foreground font-header font-bold rounded hover:opacity-90 transition-opacity"
          >
            Save Settings
          </button>
        )}

        {/* Bonus Rules Tab */}
        {activeTab === 'bonus-rules' && (
          <div className="space-y-8">
            {/* Add New Rule */}
            <div className="glass-card p-6 rounded-lg">
              <h2 className="text-2xl font-display font-bold mb-6">Add New Bonus Rule</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-header font-semibold mb-2">Rule Name</label>
                  <input
                    type="text"
                    value={newRule.name || ''}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    placeholder="e.g., Holiday Sale Bonus"
                    className="w-full bg-input-background border border-border rounded px-3 py-2 text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-header font-semibold mb-2">Rule Type</label>
                  <select
                    value={newRule.type || 'percentage'}
                    onChange={(e) => setNewRule({ ...newRule, type: e.target.value as any })}
                    className="w-full bg-input-background border border-border rounded px-3 py-2 text-foreground"
                  >
                    <option value="percentage">Percentage Bonus</option>
                    <option value="fixed">Fixed Points</option>
                    <option value="milestone">Milestone (Nth Purchase)</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="tier">Purchase Tier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-header font-semibold mb-2">Description</label>
                  <input
                    type="text"
                    value={newRule.description || ''}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    placeholder="Brief description of the bonus rule"
                    className="w-full bg-input-background border border-border rounded px-3 py-2 text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-header font-semibold mb-2">Bonus Points</label>
                  <input
                    type="number"
                    value={newRule.bonusPoints || 0}
                    onChange={(e) => setNewRule({ ...newRule, bonusPoints: parseInt(e.target.value) })}
                    placeholder="Number of points or percentage"
                    className="w-full bg-input-background border border-border rounded px-3 py-2 text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-header font-semibold mb-2">Min Purchase Amount</label>
                  <input
                    type="number"
                    value={newRule.minPurchaseAmount || 0}
                    onChange={(e) => setNewRule({ ...newRule, minPurchaseAmount: parseInt(e.target.value) })}
                    placeholder="Minimum purchase amount (optional)"
                    className="w-full bg-input-background border border-border rounded px-3 py-2 text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-header font-semibold mb-2">Active</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRule.active !== false}
                      onChange={(e) => setNewRule({ ...newRule, active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Enable this rule</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleAddBonusRule}
                className="mt-6 px-8 py-3 bg-secondary text-secondary-foreground font-header font-bold rounded hover:opacity-90 transition-opacity"
              >
                Add Bonus Rule
              </button>
            </div>

            {/* Existing Rules */}
            <div className="grid grid-cols-1 gap-4">
              <h2 className="text-2xl font-display font-bold">Active Rules</h2>
              {config.bonusRules.length === 0 ? (
                <p className="text-muted-foreground">No bonus rules created yet</p>
              ) : (
                config.bonusRules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`glass-card p-6 rounded-lg border ${
                      rule.active ? 'border-secondary' : 'border-muted opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-header font-bold">{rule.name}</h3>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          className={`px-4 py-2 rounded text-sm font-header font-semibold transition-colors ${
                            rule.active
                              ? 'bg-secondary/20 text-secondary border border-secondary'
                              : 'bg-muted/20 text-muted-foreground border border-muted'
                          }`}
                        >
                          {rule.active ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="px-4 py-2 rounded text-sm font-header font-semibold bg-red-500/20 text-red-400 border border-red-500/50 hover:border-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-header font-semibold capitalize">{rule.type}</p>
                      </div>
                      {rule.bonusPoints !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Bonus:</span>
                          <p className="font-header font-semibold">
                            {rule.bonusPoints}
                            {rule.type === 'percentage' ? '%' : ' points'}
                          </p>
                        </div>
                      )}
                      {rule.minPurchaseAmount !== undefined && rule.minPurchaseAmount > 0 && (
                        <div>
                          <span className="text-muted-foreground">Min Purchase:</span>
                          <p className="font-header font-semibold">₹{rule.minPurchaseAmount}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Level Tiers Tab */}
        {activeTab === 'levels' && (
          <div className="space-y-4">
            <p className="text-muted-foreground mb-6">
              Configure loyalty level tiers. Customers advance based on total points earned.
            </p>
            {config.levelThresholds.map((level) => (
              <div key={level.level} className="glass-card p-6 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-display font-bold"
                    style={{ backgroundColor: level.badgeColor || '#666' }}
                  >
                    {level.level}
                  </div>
                  <div>
                    <h3 className="text-xl font-header font-bold">Level {level.level}</h3>
                    <p className="text-sm text-muted-foreground">{level.minPoints.toLocaleString()} points required</p>
                  </div>
                  <div className="ml-auto">
                    <p className="text-lg font-display font-bold text-secondary">{level.multiplier}x Points</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-header font-semibold mb-2">Benefits:</p>
                  <ul className="space-y-1">
                    {level.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-secondary">✓</span> {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
