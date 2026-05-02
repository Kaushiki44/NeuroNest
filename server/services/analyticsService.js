const Post = require('../models/Post');

// Helper to calculate Pearson correlation coefficient
function pearsonCorrelation(x, y) {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumX2 = x.reduce((a, b) => a + (b * b), 0);
  const sumY2 = y.reduce((a, b) => a + (b * b), 0);
  const sumXY = x.reduce((a, b, i) => a + (b * y[i]), 0);

  const numerator = (n * sumXY) - (sumX * sumY);
  const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
  
  if (denominator === 0) return 0;
  return numerator / denominator;
}

const getUserAnalytics = async (userId) => {
  const postsDesc = await Post.find({ author: userId }).sort({ createdAt: -1 });

  const totalPosts = postsDesc.length;
  const draftPostsCount = postsDesc.filter(p => p.status === 'draft').length;

  let totalViews = 0;
  let totalLikes = 0;
  let totalQualityScore = 0;
  let qualityScoredPostsCount = 0;
  let shortPostsCount = 0;

  const postsWithEngagement = postsDesc.map(post => {
    const views = post.views || 0;
    const likes = post.likes ? post.likes.length : 0;
    const qualityScore = post.qualityScore || 0;

    totalViews += views;
    totalLikes += likes;
    
    if (post.qualityScore !== undefined) {
      totalQualityScore += qualityScore;
      qualityScoredPostsCount++;
    }

    if (post.qualityFeedback && post.qualityFeedback.some(f => f.includes('quite short'))) {
      shortPostsCount++;
    }

    // engagementScore = likes * 1.0 + views * 0.1
    const engagementScore = Number(((likes * 1.0) + (views * 0.1)).toFixed(1));

    return {
      _id: post._id,
      title: post.title,
      views,
      likes,
      qualityScore,
      engagementScore,
      status: post.status,
      createdAt: post.createdAt
    };
  });

  const avgQualityScore = qualityScoredPostsCount > 0 
    ? Math.round(totalQualityScore / qualityScoredPostsCount) 
    : 0;

  const totalEngagementScore = Math.round((totalLikes * 1.0) + (totalViews * 0.1));
  
  const avgEngagementPerPost = totalPosts > 0 
    ? Number((totalEngagementScore / totalPosts).toFixed(1)) 
    : 0;

  // Engagement Score Label
  let engagementLabel = 'Low';
  if (avgEngagementPerPost >= 20) engagementLabel = 'High';
  else if (avgEngagementPerPost >= 5) engagementLabel = 'Medium';

  // 1. Engagement Trend (Newest vs Oldest half)
  let engagementTrend = null;
  if (totalPosts >= 6) {
    const half = Math.floor(totalPosts / 2);
    const newestHalf = postsWithEngagement.slice(0, half);
    const oldestHalf = postsWithEngagement.slice(totalPosts - half, totalPosts);
    
    const newestAvg = newestHalf.reduce((acc, p) => acc + p.engagementScore, 0) / half;
    const oldestAvg = oldestHalf.reduce((acc, p) => acc + p.engagementScore, 0) / half;
    
    if (oldestAvg > 0) {
      const percentageChange = ((newestAvg - oldestAvg) / oldestAvg) * 100;
      engagementTrend = {
        value: Number(percentageChange.toFixed(1)),
        isPositive: percentageChange >= 0
      };
    }
  }

  // 2. Correlation Engine (Quality vs Engagement)
  let correlation = { value: 0, strength: 'None' };
  if (totalPosts >= 5) {
    const qScores = postsWithEngagement.map(p => p.qualityScore);
    const eScores = postsWithEngagement.map(p => p.engagementScore);
    const r = pearsonCorrelation(qScores, eScores);
    
    let strength = 'Weak';
    if (Math.abs(r) > 0.5) strength = 'Strong';
    else if (Math.abs(r) >= 0.2) strength = 'Moderate';
    
    correlation = {
      value: Number(r.toFixed(2)),
      strength
    };
  }

  // 3. Comparative Analytics (Top 25% vs Bottom 25%)
  let comparative = null;
  const publishedWithEngagement = postsWithEngagement.filter(p => p.status === 'published');
  if (publishedWithEngagement.length >= 4) {
    const sortedByEngagement = [...publishedWithEngagement].sort((a, b) => b.engagementScore - a.engagementScore);
    const quarter = Math.max(1, Math.floor(publishedWithEngagement.length / 4));
    
    const topQuarter = sortedByEngagement.slice(0, quarter);
    const bottomQuarter = sortedByEngagement.slice(publishedWithEngagement.length - quarter, publishedWithEngagement.length);
    
    const topAvgEngagement = topQuarter.reduce((acc, p) => acc + p.engagementScore, 0) / quarter;
    const bottomAvgEngagement = bottomQuarter.reduce((acc, p) => acc + p.engagementScore, 0) / quarter;
    const topAvgQuality = topQuarter.reduce((acc, p) => acc + p.qualityScore, 0) / quarter;
    const bottomAvgQuality = bottomQuarter.reduce((acc, p) => acc + p.qualityScore, 0) / quarter;

    comparative = {
      topEngagement: Number(topAvgEngagement.toFixed(1)),
      bottomEngagement: Number(bottomAvgEngagement.toFixed(1)),
      topQuality: Number(topAvgQuality.toFixed(1)),
      bottomQuality: Number(bottomAvgQuality.toFixed(1)),
      multiplier: bottomAvgEngagement > 0 ? Number((topAvgEngagement / bottomAvgEngagement).toFixed(1)) : 0
    };
  }

  // 4. Actionable Suggestions
  const suggestions = [];
  if (correlation.strength === 'Strong' && correlation.value > 0) {
    suggestions.push("There is a strong positive correlation between your Quality Score and Engagement. Focus purely on improving content quality to see a direct boost in readership.");
  }
  if (avgQualityScore > 0 && avgQualityScore < 60) {
    suggestions.push("Your average quality score is below 60. Try improving your post structure, using more headings, and breaking up long paragraphs.");
  }
  if (shortPostsCount > 0 && (shortPostsCount / totalPosts) >= 0.2) {
    suggestions.push("Several of your posts are quite short (<150 words). Search engines and readers prefer in-depth content. Try expanding on your core concepts.");
  }
  if (suggestions.length === 0) {
    suggestions.push("Keep up the great work! Your content formatting and lengths are consistently solid.");
  }

  // Top 3 posts sorted by engagement score
  const topPerformingPosts = [...publishedWithEngagement]
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 3);

  return {
    totalPosts,
    publishedPosts: publishedWithEngagement.length,
    draftPosts: draftPostsCount,
    totalViews,
    totalLikes,
    avgQualityScore,
    totalEngagementScore,
    engagementLabel,
    topPerformingPosts,
    allPosts: postsWithEngagement,
    insights: {
      trend: engagementTrend,
      correlation,
      comparative,
      suggestions
    }
  };
};

module.exports = {
  getUserAnalytics
};
