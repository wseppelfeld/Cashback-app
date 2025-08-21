import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '../services/api';

export default function WalletScreen() {
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeemDescription, setRedeemDescription] = useState('');

  const queryClient = useQueryClient();

  const { data: walletData } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletService.getWallet(),
  });

  const { data: movementsData } = useQuery({
    queryKey: ['wallet-movements'],
    queryFn: () => walletService.getMovements(1, 50),
  });

  const redeemMutation = useMutation({
    mutationFn: ({ amount, description }: { amount: number; description: string }) =>
      walletService.redeem(amount, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-movements'] });
      setShowRedeemModal(false);
      setRedeemAmount('');
      setRedeemDescription('');
      Alert.alert('Success', 'Cashback redeemed successfully!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to redeem cashback');
    },
  });

  const handleRedeem = () => {
    const amount = parseFloat(redeemAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!redeemDescription.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (amount > (walletData?.data?.balance || 0)) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    redeemMutation.mutate({ amount, description: redeemDescription.trim() });
  };

  const renderMovement = ({ item }: { item: any }) => (
    <View style={styles.movementCard}>
      <View style={styles.movementHeader}>
        <View style={styles.movementIcon}>
          <Ionicons
            name={item.type === 'credit' ? 'add-circle' : 'remove-circle'}
            size={24}
            color={item.type === 'credit' ? '#4CAF50' : '#f44336'}
          />
        </View>
        <View style={styles.movementInfo}>
          <Text style={styles.movementDescription}>
            {item.description}
          </Text>
          <Text style={styles.movementDate}>
            {new Date(item.createdAt).toLocaleDateString()} at{' '}
            {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
        </View>
        <View style={styles.movementAmount}>
          <Text style={[
            styles.amountText,
            item.type === 'credit' ? styles.creditText : styles.debitText
          ]}>
            {item.type === 'credit' ? '+' : '-'}${item.amount.toFixed(2)}
          </Text>
          <Text style={styles.balanceText}>
            Balance: ${item.balanceAfter.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Wallet Balance Header */}
      <View style={styles.balanceContainer}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            ${walletData?.data?.balance?.toFixed(2) || '0.00'}
          </Text>
          <TouchableOpacity
            style={styles.redeemButton}
            onPress={() => setShowRedeemModal(true)}
            disabled={!walletData?.data?.balance || walletData.data.balance <= 0}
          >
            <Ionicons name="card" size={20} color="white" />
            <Text style={styles.redeemButtonText}>Redeem Cashback</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Wallet Movements */}
      <View style={styles.movementsContainer}>
        <Text style={styles.movementsTitle}>Transaction History</Text>
        {movementsData?.data?.length > 0 ? (
          <FlatList
            data={movementsData.data}
            renderItem={renderMovement}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Wallet Activity</Text>
            <Text style={styles.emptyText}>
              Your wallet movements will appear here when you earn or redeem cashback.
            </Text>
          </View>
        )}
      </View>

      {/* Redeem Modal */}
      <Modal
        visible={showRedeemModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRedeemModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Redeem Cashback</Text>
              <TouchableOpacity
                onPress={() => setShowRedeemModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalBalance}>
              Available: ${walletData?.data?.balance?.toFixed(2) || '0.00'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Amount to redeem"
              value={redeemAmount}
              onChangeText={setRedeemAmount}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Description (e.g., Bank transfer)"
              value={redeemDescription}
              onChangeText={setRedeemDescription}
              multiline
            />

            <TouchableOpacity
              style={[styles.confirmButton, redeemMutation.isPending && styles.disabledButton]}
              onPress={handleRedeem}
              disabled={redeemMutation.isPending}
            >
              <Text style={styles.confirmButtonText}>
                {redeemMutation.isPending ? 'Processing...' : 'Confirm Redemption'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  balanceContainer: {
    padding: 20,
  },
  balanceCard: {
    backgroundColor: '#2196F3',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 5,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  redeemButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  redeemButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  movementsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  movementsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  movementCard: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  movementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  movementIcon: {
    marginRight: 15,
  },
  movementInfo: {
    flex: 1,
  },
  movementDescription: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  movementDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  movementAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  creditText: {
    color: '#4CAF50',
  },
  debitText: {
    color: '#f44336',
  },
  balanceText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalBalance: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});