# Memory System & Cache Management Testing Guide

## 🎯 Overview

This guide helps you verify that the new memory-aware API and advanced cache management system are working correctly in your NeuraStack application.

## 🧠 Memory System Testing

### 1. Access Memory Verification

1. **Open the Chat Page**: Navigate to `/chat`
2. **Look for the Header**: You should see a header with:
   - Badge showing "Memory API" (green) or "Legacy API" (orange)
   - "Session Active" badge if logged in
   - Database icon (🗄️) for Memory Verification
   - Settings icon (⚙️) for Cache Management

3. **Click the Database Icon**: Opens the Memory Verification modal

### 2. Memory Verification Features

#### API Configuration Panel
- **Toggle Switch**: Switch between New Memory API and Legacy API
- **Session ID**: Shows current session (first 8 characters)
- **User ID**: Shows current user ID if logged in
- **New Session Button**: Generate a new session ID

#### System Status Panel
- **API Health**: Shows health status with color-coded badges
- **Memory System**: Shows number of memories and tokens saved
- **Chat Messages**: Shows total messages and how many have memory context

#### Memory Metrics Detail (when using New API)
- **Average Importance**: Percentage of memory importance
- **Compression Ratio**: How much memory is compressed
- **Memory Distribution**: Breakdown by memory type
- **Retention Stats**: Active, archived, and expired memories

#### Test Memory API
- **Test Button**: Sends a test message to verify memory functionality
- **Results Display**: Shows response with memory context, token counts, and ensemble mode status

### 3. Testing Steps

1. **Enable New API**: Toggle the "Use New Memory-Aware API" switch
2. **Check Health**: Click "Check Health" to verify API connectivity
3. **Test Memory**: Click "Test Memory API" to send a test message
4. **Verify Results**: Look for:
   - ✅ Response received
   - Token count badge
   - Memory tokens saved badge
   - Ensemble/Single Model badge
   - Memory context display

## 🗄️ Cache Management Testing

### 1. Access Cache Manager

1. **Click the Settings Icon** in the chat header
2. **Cache Management Modal** opens with comprehensive controls

### 2. Cache Manager Features

#### Cache Statistics
- **Cache Size**: Current entries vs maximum (with percentage)
- **App Version**: Current build version and hash
- **Last Updated**: When stats were last refreshed
- **Progress Bar**: Visual representation of cache utilization

#### Cache Actions
- **Clear Cache**: Removes all cached entries
- **Force Refresh**: Clears all caches and reloads the page
- **Clear API Cache**: Removes only API-related cache entries
- **Cleanup Expired**: Removes only expired cache entries

#### Version Information
- **Build Time**: When the current version was built
- **Git Hash**: Current git commit hash
- **API Version**: Backend API version
- **Cache Version**: Current cache version identifier

#### Cache Details Modal
- **Cache Entries Table**: Shows all current cache entries with:
  - Key (truncated)
  - Age (how long cached)
  - Version (with color coding)
  - Tags (for categorization)

### 3. Testing Cache Functionality

#### Test Cache Invalidation
1. **Send a Chat Message**: Use the new API
2. **Check Cache Stats**: Should show increased cache size
3. **Clear API Cache**: Click "Clear API Cache"
4. **Verify Clearing**: Cache size should decrease

#### Test Version Detection
1. **Check Current Version**: Note the version in Cache Manager
2. **Force Refresh**: Click "Force Refresh"
3. **Verify Reload**: Page should reload with fresh cache

#### Test Automatic Cache Management
1. **Wait 5 Minutes**: Cache stats auto-refresh every 5 seconds
2. **Check Expired Cleanup**: Old entries should be automatically removed
3. **Monitor Cache Health**: Progress bar should show healthy utilization

## 🔄 Integration Testing

### 1. End-to-End Memory Flow

1. **Start Fresh Session**: Click "New Session" in Memory Verification
2. **Send Multiple Messages**: Have a conversation using the new API
3. **Check Memory Context**: Each response should show memory context
4. **Verify Persistence**: Memory should persist across messages
5. **Check Metrics**: Memory metrics should update with new data

### 2. Cache Performance Testing

1. **Send Same Query Twice**: 
   - First time: Should hit API (slower)
   - Second time: Should use cache (faster)
2. **Check Response Times**: Compare metadata in chat messages
3. **Monitor Cache Growth**: Watch cache size increase with usage
4. **Test Cache Limits**: Fill cache to near capacity and verify cleanup

### 3. Version Update Simulation

1. **Note Current Version**: Check version in Cache Manager
2. **Simulate Update**: Manually clear cache and refresh
3. **Verify Fresh Load**: All caches should be cleared
4. **Check New Session**: New session ID should be generated

## 🚨 Troubleshooting

### Memory API Issues

**Problem**: "New API Required" warning
- **Solution**: Toggle the API switch to enable new memory API

**Problem**: No memory context in responses
- **Solution**: Ensure you're logged in and using a valid session ID

**Problem**: Memory metrics not loading
- **Solution**: Check API health and verify backend connectivity

### Cache Issues

**Problem**: Cache not clearing
- **Solution**: Use "Force Refresh" to clear all caches and reload

**Problem**: Old data persisting
- **Solution**: Check cache version and clear expired entries

**Problem**: Performance degradation
- **Solution**: Monitor cache size and use cleanup functions

### API Connectivity Issues

**Problem**: Health check failing
- **Solution**: Verify backend URL and network connectivity

**Problem**: Timeout errors
- **Solution**: Check network connection and backend status

## 📊 Success Indicators

### Memory System Working Correctly
- ✅ Green "Memory API" badge in header
- ✅ Memory context appears in chat responses
- ✅ Memory metrics show increasing data
- ✅ Test API returns successful results
- ✅ Session persistence across messages

### Cache Management Working Correctly
- ✅ Cache statistics update in real-time
- ✅ Cache clearing functions work as expected
- ✅ Version detection and invalidation working
- ✅ Automatic cleanup removing expired entries
- ✅ Performance improvements from caching

### Integration Success
- ✅ Seamless switching between API modes
- ✅ Consistent session management
- ✅ Proper error handling and fallbacks
- ✅ Real-time updates and notifications
- ✅ Optimal performance with smart caching

## 🎉 Next Steps

Once testing is complete and everything is working:

1. **Production Deployment**: Deploy with confidence knowing the system is tested
2. **Monitor Performance**: Use the built-in monitoring tools
3. **User Training**: Share this guide with team members
4. **Continuous Monitoring**: Regularly check memory metrics and cache health
5. **Optimization**: Use insights from metrics to optimize further

## 📞 Support

If you encounter issues during testing:

1. **Check Browser Console**: Look for error messages
2. **Verify Network**: Ensure backend connectivity
3. **Clear All Caches**: Use Force Refresh as a reset
4. **Check Documentation**: Review API integration docs
5. **Contact Support**: Provide specific error messages and steps to reproduce
