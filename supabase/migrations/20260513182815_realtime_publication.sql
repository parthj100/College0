-- Enable realtime publication for tables the frontend subscribes to
alter publication supabase_realtime add table applications;
alter publication supabase_realtime add table warnings;
alter publication supabase_realtime add table honors;
alter publication supabase_realtime add table complaints;
alter publication supabase_realtime add table system_state;
