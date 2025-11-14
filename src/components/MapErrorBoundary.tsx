import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: React.ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
}

export class MapErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('Map Error Boundary caught:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map error details:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Ionicons name="warning-outline" size={60} color="#FF6B6B" />
          <Text style={styles.title}>Map Loading Error</Text>
          <Text style={styles.message}>
            The map couldn't load properly. Please try again.
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Ionicons name="refresh" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F6',
    padding: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1E1E1E',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3BB77E',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
