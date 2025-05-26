import { Modal, View, Text, TouchableOpacity } from 'react-native';

const SECTION_OPTIONS = ['QA', 'DILR', 'VARC', 'ST', 'MOCK'];

export function SectionSelectionModal({
  visible,
  selectedSection,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedSection: string | null;
  onSelect: (section: string) => void;
  onClose?: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0008',
        }}>
        <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Select Section</Text>
          {SECTION_OPTIONS.map((section) => (
            <TouchableOpacity
              key={section}
              style={{
                padding: 12,
                marginVertical: 4,
                backgroundColor: selectedSection === section ? '#007AFF' : '#eee',
                borderRadius: 6,
                minWidth: 180,
                alignItems: 'center',
              }}
              onPress={() => onSelect(section)}>
              <Text style={{ color: selectedSection === section ? 'white' : 'black' }}>
                {section}
              </Text>
            </TouchableOpacity>
          ))}
          {onClose && (
            <TouchableOpacity
              style={{
                marginTop: 12,
                padding: 10,
                backgroundColor: '#ccc',
                borderRadius: 6,
                alignItems: 'center',
              }}
              onPress={onClose}>
              <Text>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
