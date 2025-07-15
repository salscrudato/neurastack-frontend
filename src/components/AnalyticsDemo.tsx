/**
 * Analytics Demo Component
 * 
 * Demonstrates the Advanced Analytics Modal with sample API data
 */

import { Button, VStack, Text, Box } from "@chakra-ui/react";
import { useState } from "react";
import { AdvancedAnalyticsModal } from "./AdvancedAnalyticsModal";

const sampleApiResponse = {
    "status": "success",
    "data": {
        "prompt": "tell me a joke",
        "userId": "test-user-postman",
        "sessionId": "postman-session-1752578593",
        "synthesis": {
            "content": "Sure! Here's another one for you:\n\nWhy did the bicycle fall over?\n\nBecause it was two-tired! 🚲😄\n\nLet me know if you want to hear more!",
            "model": "gpt-4o-mini",
            "status": "success",
            "confidence": {
                "score": 0.6408154420007023,
                "level": "medium",
                "factors": [
                    "Based on 2 successful responses",
                    "Average role confidence: 38.9%",
                    "Response generated successfully",
                    "Adequate response length",
                    "Well-structured response",
                    "Contains reasoning elements"
                ]
            }
        },
        "roles": [
            {
                "role": "gpt4o",
                "content": "Why did the scarecrow win an award?\n\nBecause he was outstanding in his field!",
                "status": "fulfilled",
                "model": "gpt-4o-mini",
                "provider": "openai",
                "responseTime": 1907,
                "semanticConfidence": {
                    "score": 0.13,
                    "components": {
                        "grammarScore": 0.5,
                        "latencyScore": 0.5
                    }
                },
                "confidence": {
                    "score": 0.235,
                    "level": "very-low",
                    "factors": [
                        "Response generated successfully",
                        "Well-structured response",
                        "Contains reasoning elements"
                    ]
                },
                "quality": {
                    "wordCount": 13,
                    "sentenceCount": 2,
                    "averageWordsPerSentence": 6.5,
                    "hasStructure": true,
                    "hasReasoning": true,
                    "complexity": "high"
                }
            },
            {
                "confidence": {
                    "score": 0,
                    "level": "very-low",
                    "factors": []
                },
                "quality": {
                    "wordCount": 0,
                    "sentenceCount": 0,
                    "averageWordsPerSentence": 0,
                    "hasStructure": false,
                    "hasReasoning": false,
                    "complexity": 0
                }
            },
            {
                "role": "claude",
                "content": "Here's a classic clean joke for you:\n\nWhy don't scientists trust atoms?\n\nBecause they make up everything! \n\n*ba dum tss* 😄 I know, it's a bit cheesy, but it's a playful science pun that usually gets a smile. Would you like another joke?",
                "status": "fulfilled",
                "model": "claude-3-5-haiku-latest",
                "provider": "claude",
                "responseTime": 2067,
                "semanticConfidence": {
                    "score": 0.41,
                    "components": {
                        "grammarScore": 0.5,
                        "latencyScore": 0.5
                    }
                },
                "confidence": {
                    "score": 0.542,
                    "level": "low",
                    "factors": [
                        "Response generated successfully",
                        "Adequate response length",
                        "Well-structured response",
                        "Contains reasoning elements"
                    ]
                },
                "quality": {
                    "wordCount": 41,
                    "sentenceCount": 4,
                    "averageWordsPerSentence": 10.25,
                    "hasStructure": true,
                    "hasReasoning": true,
                    "complexity": "high"
                }
            }
        ],
        "voting": {
            "winner": "claude",
            "confidence": 0.9,
            "consensus": "strong",
            "weights": {
                "gpt4o": 0.48279285241561876,
                "claude": 0.5172071475843812
            },
            "traditionalVoting": {
                "winner": "claude",
                "confidence": null,
                "weights": {
                    "gpt4o": null,
                    "claude": null
                },
                "_description": "Traditional confidence-based voting without sophisticated enhancements"
            },
            "hybridVoting": {
                "winner": "claude",
                "confidence": 0.5172071475843812,
                "weights": {
                    "gpt4o": 0.48279285241561876,
                    "claude": 0.5172071475843812
                },
                "_description": "Hybrid voting combining traditional, diversity, historical, and semantic factors"
            },
            "diversityAnalysis": {
                "overallDiversity": 1,
                "diversityWeights": {
                    "gpt4o": 1.2,
                    "claude": 1.2
                },
                "clusterAnalysis": {
                    "clusters": [
                        {
                            "id": 0,
                            "responses": [
                                "gpt4o"
                            ],
                            "averageSimilarity": 0,
                            "size": 1
                        },
                        {
                            "id": 1,
                            "responses": [
                                "claude"
                            ],
                            "averageSimilarity": 0,
                            "size": 1
                        }
                    ],
                    "totalClusters": 2,
                    "largestCluster": 1,
                    "averageClusterSize": 1
                },
                "_description": "Semantic diversity analysis showing how different responses are from each other"
            },
            "historicalPerformance": {
                "weights": {
                    "gpt-4o-mini": 1,
                    "claude-3-5-haiku-latest": 1
                },
                "_description": "Model weights based on historical voting performance and accuracy"
            },
            "tieBreaking": {
                "used": false,
                "_description": "No tie-breaking was needed for this voting decision"
            },
            "metaVoting": {
                "used": true,
                "winner": "claude",
                "confidence": 0.9,
                "reasoning": "Response_B is chosen as the winner due to its higher clarity, completeness, and practical value. The joke provided is not only accurate and relevant to the user's request, but it also includes a playful pun that adds humor. Response_A is also good but slightly less clear and lacks the additional playful element present in Response_B.",
                "ranking": [
                    "claude",
                    "gpt4o"
                ],
                "_description": "AI-powered meta-voting analysis for quality assessment and ranking"
            },
            "abstention": {
                "triggered": true,
                "reasons": [
                    "low_semantic_confidence"
                ],
                "severity": "low",
                "recommendedStrategy": "high_quality_focused",
                "qualityMetrics": {
                    "overallQuality": null,
                    "successRate": 0.6666666666666666,
                    "failureRate": 0,
                    "avgConfidence": null,
                    "avgResponseLength": 157,
                    "avgResponseTime": 1987,
                    "avgSemanticConfidence": 0.27,
                    "consensusStrength": 0.8,
                    "votingConfidence": 0.9,
                    "weightDistribution": 0.03441429516876249,
                    "diversityScore": 1,
                    "clusterCount": 2,
                    "responseCount": 2,
                    "failedCount": 0
                },
                "_description": "Abstention analysis determining if response quality requires re-querying"
            },
            "analytics": {
                "processingTime": 3343,
                "votingDecisionId": "voting_1752578636210_by27nyzx2",
                "sophisticatedFeaturesUsed": [
                    "diversity_analysis",
                    "historical_performance",
                    "meta_voting",
                    "abstention"
                ],
                "qualityScore": 0.815,
                "_description": "Comprehensive analytics showing which sophisticated voting features were utilized"
            },
            "_sophisticatedVotingVersion": "1.0",
            "_backwardCompatible": true
        },
        "metadata": {
            "processingTime": 40433,
            "correlationId": "0061e65e",
            "explainMode": true
        }
    },
    "correlationId": "0061e65e",
    "explanation": {}
};

export function AnalyticsDemo() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <VStack spacing={6} p={8} align="center">
            <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="#1E293B" mb={2}>
                    Advanced Analytics Modal Demo
                </Text>
                <Text fontSize="md" color="#64748B" mb={6}>
                    Click the button below to see the comprehensive analytics dashboard
                </Text>
            </Box>
            
            <Button
                onClick={() => setIsModalOpen(true)}
                bg="linear-gradient(135deg, #4F9CF9 0%, #3B82F6 100%)"
                color="white"
                fontWeight="600"
                fontSize="md"
                px={8}
                py={6}
                h="auto"
                borderRadius="xl"
                boxShadow="0 4px 16px rgba(79, 156, 249, 0.3)"
                _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(79, 156, 249, 0.4)"
                }}
                _active={{
                    transform: "translateY(0)"
                }}
            >
                Open Advanced Analytics
            </Button>

            <AdvancedAnalyticsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                analyticsData={sampleApiResponse}
            />
        </VStack>
    );
}
