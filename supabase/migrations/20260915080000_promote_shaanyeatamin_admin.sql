-- One-off data change: promote shaanyeatamin@gmail.com to admin
do $$
begin
  if not exists (select 1 from profiles where email = 'shaanyeatamin@gmail.com') then
    raise exception 'Account shaanyeatamin@gmail.com not found in profiles';
  end if;
  update profiles set role = 'admin' where email = 'shaanyeatamin@gmail.com';
end $$;
