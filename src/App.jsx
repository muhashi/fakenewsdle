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

import dataset from './data/dataset.json';


export default function OnionGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userGuess, setUserGuess] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [headlines, setHeadlines] = useState([]);

  // Initialize headlines on component mount
  useEffect(() => {
    // Shuffle the headlines for randomness
    const shuffled = [...dataset].sort(() => Math.random() - 0.5).slice(0, 10); // Limit to 10 for quicker games
    setHeadlines(shuffled);
  }, []);

  const currentHeadline = headlines[currentIndex];

  const handleGuess = (guess) => {
    setUserGuess(guess);
    setShowResult(true);
    setTotalAnswered(prev => prev + 1);
    
    if (guess === currentHeadline?.isOnion) {
      setScore(prev => prev + 1);
    }
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

  const resetGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setTotalAnswered(0);
    setShowResult(false);
    setUserGuess(null);
    setGameComplete(false);
    // Shuffle headlines again
    const shuffled = [...dataset].sort(() => Math.random() - 0.5).splice(0, 10);
    setHeadlines(shuffled);
  };

  const getScoreColor = () => {
    const percentage = totalAnswered > 0 ? (score / totalAnswered) * 100 : 0;
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'yellow';
    return 'red';
  };

  if (headlines.length === 0) {
    return (
      <Container size="md" py="xl">
        <Center>
          <Text>Loading headlines...</Text>
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
              <Title order={1} color="blue">🎉 Game Complete! 🎉</Title>
              
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
              
              <Button size="lg" onClick={resetGame}>
                Play Again
              </Button>
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
            <Title order={1} color="blue">Oniondle</Title>
            <Text c="dimmed" size="lg" align="center">
              Can you tell the difference between real news headlines and satirical Onion articles?
            </Text>
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
            value={(currentIndex / headlines.length) * 100} 
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
            <Text size="sm" c="dimmed" align="center">
              Was this a real news headline or a satirical The Onion article?
            </Text>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
