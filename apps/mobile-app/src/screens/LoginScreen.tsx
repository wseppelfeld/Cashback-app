import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { authService, regionService } from '../services/api';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [regionId, setRegionId] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: regionsData } = useQuery({
    queryKey: ['regions'],
    queryFn: () => regionService.getAll(),
  });

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isRegister && !regionId) {
      Alert.alert('Error', 'Please select a region');
      return;
    }

    setLoading(true);

    try {
      let response;
      if (isRegister) {
        response = await authService.register(email, password, regionId);
      } else {
        response = await authService.login(email, password);
      }

      if (response.success) {
        global.authToken = response.data.token;
        navigation.navigate('Main');
      } else {
        Alert.alert('Error', response.error || 'Authentication failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        {isRegister && (
          <View style={styles.regionContainer}>
            <Text style={styles.regionLabel}>Select Region:</Text>
            {regionsData?.data?.map((region: any) => (
              <TouchableOpacity
                key={region.id}
                style={[
                  styles.regionOption,
                  regionId === region.id && styles.regionOptionSelected
                ]}
                onPress={() => setRegionId(region.id)}
              >
                <Text style={[
                  styles.regionText,
                  regionId === region.id && styles.regionTextSelected
                ]}>
                  {region.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : (isRegister ? 'Register' : 'Login')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => setIsRegister(!isRegister)}
        >
          <Text style={styles.linkText}>
            {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16,
  },
  regionContainer: {
    marginBottom: 15,
  },
  regionLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  regionOption: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  regionOptionSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  regionText: {
    fontSize: 14,
    color: '#333',
  },
  regionTextSelected: {
    color: 'white',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    padding: 10,
  },
  linkText: {
    color: '#2196F3',
    fontSize: 14,
  },
});