import { Modal, View, Text, TextInput } from 'react-native';
import { Button } from './Button';

export function SessionNoteModal({ visible, note, setNote, onSave }: {
  visible: boolean;
  note: string;
  setNote: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{
        flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0008'
      }}>
        <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>
            Add a note for this session (optional)
          </Text>
          <TextInput
            placeholder="Session note"
            value={note}
            onChangeText={setNote}
            style={{
              borderWidth: 1, borderColor: '#ccc', borderRadius: 6,
              padding: 8, minWidth: 200, marginBottom: 12,
            }}
            multiline
          />
          <Button title="Save Note" onPress={onSave} />
        </View>
      </View>
    </Modal>
  );
}