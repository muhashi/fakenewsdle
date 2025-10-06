import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Card,
  Group,
  Stack,
  Progress,
  Badge,
  Center,
  Divider,
  Paper,
  RingProgress
} from '@mantine/core';

import FULL_DATASET from './data/dataset.json';

// Calculate which day it is since epoch (January 1, 1970)
const getDaysSinceEpoch = () => {
  const now = new Date();
  const start = new Date(2025, 8, 29);
  const diff = now - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

// Get the 10 headlines for today
const getTodaysHeadlines = () => {
  const dayNumber = getDaysSinceEpoch();
  const setNumber = dayNumber % Math.ceil(FULL_DATASET.length / 10);
  const startIndex = setNumber * 10;
  const endIndex = Math.min(startIndex + 10, FULL_DATASET.length);
  return FULL_DATASET.slice(startIndex, endIndex);
};

export default function OnionGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userGuess, setUserGuess] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [headlines, setHeadlines] = useState([]);
  const [todayAnswers, setTodayAnswers] = useState([]);

  // Initialize headlines on component mount
  useEffect(() => {
    const todaysHeadlines = getTodaysHeadlines();
    setHeadlines(todaysHeadlines);
    
    // Load saved progress for today
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('onionGameProgress') || '{}');
    
    if (saved.date === today && saved.answers) {
      setTodayAnswers(saved.answers);
      setCurrentIndex(saved.answers.length);
      setScore(saved.score);
      setTotalAnswered(saved.answers.length);
      
      if (saved.answers.length >= todaysHeadlines.length) {
        setGameComplete(true);
      }
    }
  }, []);

  const currentHeadline = headlines[currentIndex];

  const handleGuess = (guess) => {
    setUserGuess(guess);
    setShowResult(true);
    setTotalAnswered(prev => prev + 1);
    
    const isCorrect = guess === currentHeadline?.isOnion;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    // Save the answer
    const newAnswers = [...todayAnswers, { guess, correct: isCorrect }];
    setTodayAnswers(newAnswers);
    
    // Save progress to localStorage
    const today = new Date().toDateString();
    localStorage.setItem('onionGameProgress', JSON.stringify({
      date: today,
      answers: newAnswers,
      score: isCorrect ? score + 1 : score
    }));
  };

  const handleNext = () => {
    if (currentIndex + 1 >= headlines.length) {
      setGameComplete(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setShowResult(false);
      setUserGuess(null);
    }
  };

  const getScoreColor = () => {
    const percentage = totalAnswered > 0 ? (score / totalAnswered) * 100 : 0;
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'yellow';
    return 'red';
  };

  const getTimeUntilTomorrow = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (headlines.length === 0) {
    return (
      <Container size="md" py="xl">
        <Center>
          <Text>Loading today's headlines...</Text>
        </Center>
      </Container>
    );
  }

  if (gameComplete) {
    const finalPercentage = (score / totalAnswered) * 100;
    
    return (
      <Container size="md" py="xl">
        <Paper p="xl" radius="md" withBorder>
          <Center>
            <Stack align="center" spacing="lg">
              <Title order={1} color="blue">🎉 Today's Challenge Complete! 🎉</Title>
              
              <RingProgress
                size={200}
                thickness={16}
                sections={[{ value: finalPercentage, color: getScoreColor() }]}
                label={
                  <Center>
                    <Stack spacing={0} align="center">
                      <Text size="xl" weight={700}>{finalPercentage.toFixed(0)}%</Text>
                      <Text size="sm" c="dimmed">Accuracy</Text>
                    </Stack>
                  </Center>
                }
              />
              
              <Stack align="center" spacing="sm">
                <Text size="lg">
                  You got <strong>{score}</strong> out of <strong>{totalAnswered}</strong> headlines correct!
                </Text>
                
                <Text c="dimmed">
                  {finalPercentage >= 80 && "Excellent! You're a headline expert!"}
                  {finalPercentage >= 60 && finalPercentage < 80 && "Good job! You can spot satire pretty well!"}
                  {finalPercentage < 60 && "The Onion got you! Better luck next time!"}
                </Text>
              </Stack>
              
              <Divider w="100%" />
              
              <Stack align="center" spacing="xs">
                <Text size="lg" weight={500}>Come back tomorrow for new headlines!</Text>
                <Text c="dimmed">Next challenge in: {getTimeUntilTomorrow()}</Text>
              </Stack>
            </Stack>
          </Center>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack spacing="lg">
        {/* Header */}
        <Center>
          <Stack align="center" spacing="sm">
            <Title order={1} color="blue" className="title-text"><span>O</span><span>n</span></Title>
            <Text c="dimmed" size="lg" align="center">
              Today's Daily Challenge
            </Text>
            <Badge size="lg" variant="dot">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Badge>
          </Stack>
        </Center>

        {/* Progress and Score */}
        <Paper p="md" radius="md" withBorder>
          <Group position="apart" mb="sm">
            <Text weight={500}>
              Question {currentIndex + 1} of {headlines.length}
            </Text>
            <Badge color={getScoreColor()} size="lg">
              Score: {score}/{totalAnswered}
            </Badge>
          </Group>
          <Progress 
            value={((currentIndex + (showResult ? 1 : 0)) / headlines.length) * 100} 
            size="md" 
            radius="md"
            color="blue"
          />
        </Paper>

        {/* Main Game Card */}
        <Card shadow="md" padding="xl" radius="md" withBorder>
          <Stack spacing="lg">
            <Center>
              <Text size="xl" weight={600} align="center" style={{ lineHeight: 1.4, fontFamily: 'Georgia, Times, Times New Roman, serif' }}>
                {currentHeadline?.headline}
              </Text>
            </Center>

            {!showResult ? (
              <Group position="center" spacing="lg" justify="center">
                <Button
                  size="lg"
                  color="blue"
                  variant="filled"
                  onClick={() => handleGuess(false)}
                  style={{ minWidth: 120 }}
                >
                  📰 Real News
                </Button>
                <Button
                  size="lg"
                  color="orange"
                  variant="filled"
                  onClick={() => handleGuess(true)}
                  style={{ minWidth: 120 }}
                >
                  🧅 The Onion
                </Button>
              </Group>
            ) : (
              <Stack spacing="md">
                <Divider />
                <Center>
                  <Stack align="center" spacing="sm">
                    {userGuess === currentHeadline?.isOnion ? (
                      <Badge color="green" size="xl" variant="filled">
                        ✅ Correct!
                      </Badge>
                    ) : (
                      <Badge color="red" size="xl" variant="filled">
                        ❌ Wrong
                      </Badge>
                    )}
                    
                    <Text align="center">
                      This was a <strong>{currentHeadline?.isOnion ? 'satirical Onion' : 'real news'}</strong> headline
                    </Text>
                  </Stack>
                </Center>
                
                <Center>
                  <Button onClick={handleNext} size="md">
                    {currentIndex + 1 >= headlines.length ? 'See Final Score' : 'Next Headline'}
                  </Button>
                </Center>
              </Stack>
            )}
          </Stack>
        </Card>

        {/* Instructions */}
        {!showResult && (
          <Paper p="md" radius="md" style={{ backgroundColor: '#f8f9fa' }}>
            {/* <Text size="sm" c="dimmed" align="center">
              Was this a real news headline or a satirical The Onion article?
            </Text> */}
            <Text size="sm" c="dimmed" align="center">
              <strong>Note:</strong> These articles are from various years and may not reflect current events.
            </Text>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
