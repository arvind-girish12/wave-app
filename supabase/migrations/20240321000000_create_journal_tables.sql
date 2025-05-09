-- Create journal_entries table
CREATE TABLE journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    linked_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL
);

-- Create journal_inferences table
CREATE TABLE journal_inferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    keywords TEXT[] DEFAULT '{}',
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    summary TEXT,
    tone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX journal_entries_user_id_idx ON journal_entries(user_id);
CREATE INDEX journal_entries_linked_session_id_idx ON journal_entries(linked_session_id);
CREATE INDEX journal_inferences_journal_entry_id_idx ON journal_inferences(journal_entry_id);

-- Enable Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_inferences ENABLE ROW LEVEL SECURITY;

-- Create policies for journal_entries
CREATE POLICY "Users can view their own journal entries"
    ON journal_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries"
    ON journal_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
    ON journal_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
    ON journal_entries FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for journal_inferences
CREATE POLICY "Users can view inferences for their journal entries"
    ON journal_inferences FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM journal_entries
        WHERE journal_entries.id = journal_inferences.journal_entry_id
        AND journal_entries.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert inferences for their journal entries"
    ON journal_inferences FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM journal_entries
        WHERE journal_entries.id = journal_inferences.journal_entry_id
        AND journal_entries.user_id = auth.uid()
    ));

CREATE POLICY "Users can update inferences for their journal entries"
    ON journal_inferences FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM journal_entries
        WHERE journal_entries.id = journal_inferences.journal_entry_id
        AND journal_entries.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete inferences for their journal entries"
    ON journal_inferences FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM journal_entries
        WHERE journal_entries.id = journal_inferences.journal_entry_id
        AND journal_entries.user_id = auth.uid()
    )); 