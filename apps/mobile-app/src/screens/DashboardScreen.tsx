import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { userService, walletService, transactionService } from '../services/api';

export default function DashboardScreen() {
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: () => userService.getProfile(),
  });

  const { data: walletData } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletService.getWallet(),
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getAll(1, 5),
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello, {userData?.data?.email?.split('@')[0] || 'User'}!
        </Text>
        <Text style={styles.subtitle}>Welcome to your cashback dashboard</Text>
      </View>

      {/* Wallet Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Ionicons name="wallet" size={24} color="#4CAF50" />
          <Text style={styles.balanceTitle}>Wallet Balance</Text>
        </View>
        <Text style={styles.balanceAmount}>
          ${walletData?.data?.balance?.toFixed(2) || '0.00'}
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={20} color="#2196F3" />
          <Text style={styles.statValue}>
            {transactionsData?.data?.length || 0}
          </Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="gift" size={20} color="#FF9800" />
          <Text style={styles.statValue}>
            $
            {transactionsData?.data
              ?.reduce((sum: number, t: any) => sum + t.cashbackAmount, 0)
              ?.toFixed(2) || '0.00'}
          </Text>
          <Text style={styles.statLabel}>Total Cashback</Text>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactionsData?.data?.length > 0 ? (
          transactionsData.data.map((transaction: any) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionAmount}>
                  ${transaction.amount.toFixed(2)}
                </Text>
                <Text style={styles.transactionCashback}>
                  +${transaction.cashbackAmount.toFixed(2)} cashback
                </Text>
              </View>
              <Text style={styles.transactionDate}>
                {new Date(transaction.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        )}
      </View>

      {/* Recent Wallet Movements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {walletData?.data?.movements?.length > 0 ? (
          walletData.data.movements.slice(0, 3).map((movement: any) => (
            <View key={movement.id} style={styles.movementItem}>
              <View style={styles.movementInfo}>
                <Text style={styles.movementDescription}>
                  {movement.description}
                </Text>
                <Text style={[
                  styles.movementAmount,
                  movement.type === 'credit' ? styles.creditAmount : styles.debitAmount
                ]}>
                  {movement.type === 'credit' ? '+' : '-'}${movement.amount.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.movementDate}>
                {new Date(movement.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No recent activity</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  balanceCard: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceTitle: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    margin: 5,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionCashback: {
    fontSize: 14,
    color: '#4CAF50',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  movementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  movementInfo: {
    flex: 1,
  },
  movementDescription: {
    fontSize: 14,
    color: '#333',
  },
  movementAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  creditAmount: {
    color: '#4CAF50',
  },
  debitAmount: {
    color: '#f44336',
  },
  movementDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
});